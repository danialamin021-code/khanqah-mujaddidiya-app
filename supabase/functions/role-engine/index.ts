/**
 * Role Governance Engine — Edge Function
 * Handles: approveRole, rejectRole, assignTeacher, unassignTeacher, updateUserRoles
 * Director protection: prevent removal of last director, prevent non-director from modifying director.
 */
import { corsHeaders, jsonResponse, errorResponse, isValidUuid } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { getUserFromRequest } from "../_shared/auth.ts";

const VALID_ROLES = ["student", "teacher", "admin", "director"];

function canAssignRoles(roles: string[]): boolean {
  return roles.includes("director");
}

function canAssignTeacherOrAdmin(roles: string[]): boolean {
  return roles.includes("admin") || roles.includes("director");
}

async function getMyRoles(supabase: ReturnType<typeof import("../_shared/supabase.ts").getServiceClient>, userId: string): Promise<string[]> {
  const { data } = await supabase.from("profiles").select("roles").eq("id", userId).single();
  return (data?.roles ?? []) as string[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) return errorResponse("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const payload = body.payload ?? body;

    const supabase = getServiceClient();
    if (!supabase) return errorResponse("Service unavailable", 503);

    const myRoles = await getMyRoles(supabase, user.userId);

    if (action === "approveRole") {
      const targetUserId = payload.targetUserId as string;
      const grantRole = payload.grantRole as "teacher" | "admin";
      if (!targetUserId || !grantRole) return errorResponse("targetUserId, grantRole required");
      if (!isValidUuid(targetUserId)) return errorResponse("Invalid targetUserId");
      if (!["teacher", "admin"].includes(grantRole)) return errorResponse("Invalid grantRole");

      if (grantRole === "admin") {
        if (!canAssignRoles(myRoles)) return errorResponse("Only a Director can approve Admin requests");
      } else {
        if (!canAssignTeacherOrAdmin(myRoles)) return errorResponse("Only Admin or Director can approve Teacher requests");
      }

      const { data: target } = await supabase.from("profiles").select("roles, role_request").eq("id", targetUserId).single();
      if (!target) return errorResponse("User not found");

      const roleRequest = (target as { role_request?: string | null }).role_request;
      const expected = grantRole === "teacher" ? "pending_teacher" : "pending_admin";
      if (roleRequest !== expected) return errorResponse("No matching pending request");

      const currentRoles = (target as { roles?: string[] }).roles ?? ["student"];
      const newRoles = [...new Set([...currentRoles, grantRole])];

      const { error } = await supabase.from("profiles").update({ roles: newRoles, role_request: null }).eq("id", targetUserId);
      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: myRoles[0] ?? "admin",
        action_type: "approve_role_request",
        entity_type: "user",
        entity_id: targetUserId,
        description: `Approved ${grantRole} role request`,
        metadata: { grantRole, newRoles },
      });
      return jsonResponse({ success: true });
    }

    if (action === "rejectRole") {
      const targetUserId = payload.targetUserId as string;
      if (!targetUserId) return errorResponse("targetUserId required");
      if (!isValidUuid(targetUserId)) return errorResponse("Invalid targetUserId");

      if (!canAssignTeacherOrAdmin(myRoles) && !canAssignRoles(myRoles)) {
        await supabase.from("system_activity_logs").insert({
          actor_id: user.userId,
          actor_role: myRoles[0] ?? "student",
          action_type: "failed_authorization",
          entity_type: "user",
          entity_id: targetUserId,
          description: "Reject role request: not authorized",
          metadata: { action: "reject_role_request" },
        });
        return errorResponse("Not authorized");
      }

      const { error } = await supabase.from("profiles").update({ role_request: null }).eq("id", targetUserId);
      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: myRoles[0] ?? "admin",
        action_type: "reject_role_request",
        entity_type: "user",
        entity_id: targetUserId,
        description: "Rejected role request",
        metadata: {},
      });
      return jsonResponse({ success: true });
    }

    if (action === "assignTeacher") {
      if (!canAssignTeacherOrAdmin(myRoles)) return errorResponse("Unauthorized");

      const moduleId = payload.moduleId as string;
      const teacherUserId = payload.userId as string;
      if (!moduleId || !teacherUserId) return errorResponse("moduleId, userId required");
      if (!isValidUuid(moduleId) || !isValidUuid(teacherUserId)) return errorResponse("Invalid moduleId or userId");

      const { error } = await supabase.from("module_teachers").insert({ module_id: moduleId, user_id: teacherUserId });
      if (error) return errorResponse(error.message);

      const { data: mod } = await supabase.from("modules").select("title, slug").eq("id", moduleId).single();
      const moduleTitle = (mod as { title?: string } | null)?.title ?? "a module";
      const moduleSlug = (mod as { slug?: string } | null)?.slug ?? "";

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: myRoles[0] ?? "admin",
        action_type: "assign_teacher",
        entity_type: "module",
        entity_id: moduleId,
        description: "Assigned teacher to module",
        metadata: { teacherUserId },
      });

      await supabase.from("notifications").insert({
        user_id: teacherUserId,
        type: "module_assignment",
        title: "Module assignment",
        body: `You have been assigned to teach ${moduleTitle}.`,
        metadata: { moduleId, moduleSlug },
      });
      return jsonResponse({ success: true });
    }

    if (action === "unassignTeacher") {
      if (!canAssignTeacherOrAdmin(myRoles)) return errorResponse("Unauthorized");

      const moduleId = payload.moduleId as string;
      const teacherUserId = payload.userId as string;
      if (!moduleId || !teacherUserId) return errorResponse("moduleId, userId required");
      if (!isValidUuid(moduleId) || !isValidUuid(teacherUserId)) return errorResponse("Invalid moduleId or userId");

      const { data: teachers } = await supabase.from("module_teachers").select("user_id").eq("module_id", moduleId);
      const count = teachers?.length ?? 0;
      if (count <= 1) return errorResponse("Cannot remove the last teacher. Module must have at least one teacher.");

      const { error } = await supabase.from("module_teachers").delete().eq("module_id", moduleId).eq("user_id", teacherUserId);
      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: myRoles[0] ?? "admin",
        action_type: "unassign_teacher",
        entity_type: "module",
        entity_id: moduleId,
        description: "Unassigned teacher from module",
        metadata: { teacherUserId },
      });
      return jsonResponse({ success: true });
    }

    if (action === "updateUserRoles") {
      const targetUserId = payload.targetUserId as string;
      const newRoles = payload.newRoles as string[];
      if (!targetUserId || !Array.isArray(newRoles)) return errorResponse("targetUserId, newRoles required");
      if (!isValidUuid(targetUserId)) return errorResponse("Invalid targetUserId");

      if (targetUserId === user.userId) return errorResponse("You cannot change your own roles");

      const targetHasDirector = newRoles.includes("director");
      const { data: targetProfile } = await supabase.from("profiles").select("roles").eq("id", targetUserId).single();
      const targetHadDirector = (targetProfile?.roles ?? []).includes("director");

      if (targetHasDirector || newRoles.includes("admin")) {
        if (!canAssignRoles(myRoles)) return errorResponse("Only a Director can assign Admin or Director role");
      } else if (targetHadDirector) {
        if (!canAssignRoles(myRoles)) return errorResponse("Only a Director can modify the Director role");
      } else if (newRoles.some((r) => r === "teacher")) {
        if (!canAssignTeacherOrAdmin(myRoles)) return errorResponse("Only Admin or Director can assign roles");
      }

      if (targetHadDirector && !targetHasDirector) {
        const { data: directors } = await supabase.from("profiles").select("id").contains("roles", ["director"]);
        const directorCount = directors?.length ?? 0;
        if (directorCount <= 1) return errorResponse("Cannot remove the last Director");
      }

      const sanitized = newRoles.filter((r) => VALID_ROLES.includes(r));
      if (sanitized.length === 0) return errorResponse("At least one role required");

      const { error } = await supabase.from("profiles").update({ roles: sanitized }).eq("id", targetUserId);
      if (error) return errorResponse(error.message);

      await supabase.from("system_activity_logs").insert({
        actor_id: user.userId,
        actor_role: myRoles[0] ?? "admin",
        action_type: "update_user_roles",
        entity_type: "user",
        entity_id: targetUserId,
        description: `Updated user roles to: ${sanitized.join(", ")}`,
        metadata: { newRoles: sanitized },
      });
      return jsonResponse({ success: true });
    }

    return errorResponse("Unknown action");
  } catch (e) {
    console.error("[role-engine]", e);
    return errorResponse("Internal error", 500);
  }
});
