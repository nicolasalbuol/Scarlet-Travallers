export function generateInviteCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function isMaster(campaign, user) {
  return !!campaign && !!user?.email && campaign.master_email === user.email;
}

export function memberOf(campaign, user) {
  if (!campaign || !user?.email) return null;
  return (campaign.members || []).find((m) => m.user_email === user.email) || null;
}

export function isMember(campaign, user) {
  return !!memberOf(campaign, user);
}

export function canAccess(campaign, user) {
  return isMaster(campaign, user) || isMember(campaign, user);
}

export function campaignOfCharacter(campaigns, characterId) {
  if (!characterId) return null;
  return (
    (campaigns || []).find((c) =>
      (c.members || []).some((m) => m.character_id === characterId)
    ) || null
  );
}

export function inviteLink(code) {
  return code ? `${window.location.origin}/campaigns?join=${code}` : "";
}