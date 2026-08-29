import { permissionDeniedMessage, permissionFromError } from "@/lib/permissions";

export const DEFAULT_ERROR_MESSAGE = "Something went wrong. Try again.";

interface ErrorDetails {
  status?: number;
  code?: string;
  message?: string;
}

const CODE_MESSAGES: Record<string, string> = {
  API_NOT_CONFIGURED: "This service is not ready yet. Try again later.",
  BUSINESS_NAME_ALREADY_EXISTS: "This business name is already in use.",
  BUSINESS_NAME_IN_USE: "This business name is already in use.",
  CURRENT_PASSWORD_INCORRECT: "Your current password is incorrect.",
  DUPLICATE_BUSINESS_NAME: "This business name is already in use.",
  DUPLICATE_EMAIL: "An account already uses this email.",
  DUPLICATE_PHONE_NUMBER: "This phone number is already in use.",
  EMAIL_ALREADY_EXISTS: "An account already uses this email.",
  EMAIL_ALREADY_REGISTERED: "An account already uses this email.",
  EMAIL_IN_USE: "An account already uses this email.",
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  INVALID_EMAIL: "Enter a valid email address.",
  INVALID_INVITATION: "This invitation is invalid or expired.",
  INVALID_INVITE: "This invitation is invalid or expired.",
  INVALID_OTP: "That verification code is invalid or expired.",
  INVALID_PHONE_NUMBER: "Enter a valid phone number.",
  INVALID_VERIFICATION_CODE: "That verification code is invalid or expired.",
  INVALID_RESPONSE: "We couldn't read the server response. Try again.",
  INVITATION_EXPIRED: "This invitation is invalid or expired.",
  INVITE_EXPIRED: "This invitation is invalid or expired.",
  NETWORK_ERROR: "We couldn't connect. Check your internet and try again.",
  OTP_EXPIRED: "That verification code is invalid or expired.",
  PHONE_IN_USE: "This phone number is already in use.",
  PHONE_ALREADY_EXISTS: "This phone number is already in use.",
  PHONE_ALREADY_REGISTERED: "This phone number is already in use.",
  PHONE_NUMBER_ALREADY_EXISTS: "This phone number is already in use.",
  PHONE_NUMBER_IN_USE: "This phone number is already in use.",
  REQUEST_TIMEOUT: "That took too long. Try again.",
  SESSION_EXPIRED: "Your session has expired. Sign in again.",
  UNAUTHENTICATED: "Please sign in to continue.",
  UPSTREAM_TIMEOUT: "The service took too long to respond. Try again.",
  UPSTREAM_UNAVAILABLE: "The service is unavailable right now. Try again shortly.",
  VERIFICATION_CODE_EXPIRED: "That verification code is invalid or expired.",
};

const DEDICATED_ERROR_CODES = new Set([
  "BUSINESS_NAME_ALREADY_EXISTS",
  "BUSINESS_NAME_IN_USE",
  "CURRENT_PASSWORD_INCORRECT",
  "DUPLICATE_BUSINESS_NAME",
  "DUPLICATE_EMAIL",
  "DUPLICATE_PHONE_NUMBER",
  "EMAIL_ALREADY_EXISTS",
  "EMAIL_ALREADY_REGISTERED",
  "EMAIL_IN_USE",
  "INVALID_CREDENTIALS",
  "INVALID_EMAIL",
  "INVALID_INVITATION",
  "INVALID_INVITE",
  "INVALID_OTP",
  "INVALID_PHONE_NUMBER",
  "INVALID_VERIFICATION_CODE",
  "INVITATION_EXPIRED",
  "INVITE_EXPIRED",
  "OTP_EXPIRED",
  "PHONE_ALREADY_EXISTS",
  "PHONE_ALREADY_REGISTERED",
  "PHONE_IN_USE",
  "PHONE_NUMBER_ALREADY_EXISTS",
  "PHONE_NUMBER_IN_USE",
  "VERIFICATION_CODE_EXPIRED",
]);

const STATUS_MESSAGES: Record<number, string> = {
  400: "Check the information and try again.",
  401: "Your session has expired. Sign in again.",
  402: "Payment is required to continue.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you requested.",
  405: "That action isn't available.",
  408: "That took too long. Try again.",
  409: "That already exists. Try a different value.",
  410: "This is no longer available.",
  413: "This file is too large.",
  415: "This file type isn't supported.",
  422: "Check the highlighted information.",
  429: "Too many attempts. Wait a moment and try again.",
  500: "We hit a problem. Try again shortly.",
  502: "The service is unavailable right now. Try again shortly.",
  503: "The service is unavailable right now. Try again shortly.",
  504: "The service took too long to respond. Try again.",
};

function actionForRequest(path: string, method: string): string {
  const cleanPath = path.toLowerCase().split("?")[0];
  const verb = method.toUpperCase();
  const isRead = verb === "GET" || verb === "HEAD";

  if (/\/auth\/signup\/check\/business-name/.test(cleanPath)) return "check the business name";
  if (/\/auth\/signup\/check\/phone/.test(cleanPath)) return "check the phone number";
  if (/\/auth\/(?:signup\/)?otp\/request|\/auth\/invite\/otp\/request/.test(cleanPath)) return "send the verification code";
  if (/\/auth\/(?:signup\/)?otp\/verify|\/auth\/invite\/otp\/verify/.test(cleanPath)) return "verify the code";
  if (/\/auth\/2fa\/verify/.test(cleanPath)) return "verify your two-factor code";
  if (/\/auth\/2fa\/setup/.test(cleanPath)) return "start two-factor authentication setup";
  if (/\/auth\/2fa\/confirm/.test(cleanPath)) return "enable two-factor authentication";
  if (/\/auth\/2fa\/disable/.test(cleanPath)) return "disable two-factor authentication";
  if (/\/auth\/login/.test(cleanPath)) return "sign you in";
  if (/\/auth\/logout/.test(cleanPath)) return "sign you out";
  if (/\/auth\/refresh/.test(cleanPath)) return "refresh your session";
  if (/\/auth\/me/.test(cleanPath)) return "load your account";
  if (/\/auth\/sessions\//.test(cleanPath) && verb === "DELETE") return "sign out that device";
  if (/\/auth\/sessions/.test(cleanPath)) return "load your signed-in devices";
  if (/\/auth\/register\/invite/.test(cleanPath)) return "complete your registration";
  if (/\/auth\/signup|\/onboarding/.test(cleanPath)) return "complete account setup";

  if (/\/availability\//.test(cleanPath)) return "check availability";
  if (/\/dashboard\/bootstrap/.test(cleanPath)) return "load the dashboard";
  if (/\/kpi-snapshots\/overview/.test(cleanPath)) return "load the insights overview";
  if (/\/stats/.test(cleanPath)) return "load the statistics";
  if (/\/activities\/summary/.test(cleanPath)) return "load the activity summary";
  if (/\/activity-log\/trend/.test(cleanPath)) return "load the activity trend";
  if (/\/live-pulse/.test(cleanPath)) return "load the wellbeing pulse";
  if (/\/trends/.test(cleanPath)) return "load the wellbeing trends";
  if (/\/leaderboard/.test(cleanPath)) return "load the leaderboard";

  if (/\/branches\/[^/]+\/members\/[^/]+/.test(cleanPath) && !isRead) return "transfer the team member";
  if (/\/branches\/[^/]+\/manager/.test(cleanPath)) return "assign the branch manager";
  if (/\/branches\/active|\/branches\/current/.test(cleanPath)) return "switch branches";
  if (/\/branches/.test(cleanPath)) {
    if (isRead) return "load the branches";
    if (verb === "POST") return "create the branch";
    if (verb === "DELETE") return "delete the branch";
    return "update the branch";
  }

  if (/\/departments\/[^/]+\/members/.test(cleanPath)) {
    if (isRead) return "load the department members";
    return verb === "DELETE" ? "remove the department member" : "assign the department member";
  }
  if (/\/departments\/[^/]+\/transfer/.test(cleanPath)) return "transfer the department members";
  if (/\/departments\/ranks/.test(cleanPath)) return "load the department rankings";
  if (/\/departments/.test(cleanPath)) {
    if (isRead) return "load the departments";
    if (verb === "POST") return "create the department";
    if (verb === "DELETE") return "delete the department";
    return "update the department";
  }

  if (/\/events\/[^/]+\/participants/.test(cleanPath)) {
    if (isRead) return "load the event participants";
    return verb === "DELETE" ? "remove the event participant" : "invite the event participant";
  }
  if (/\/events\/[^/]+\/join/.test(cleanPath)) return "join the event";
  if (/\/events/.test(cleanPath)) {
    if (isRead) return "load the events";
    if (verb === "POST") return "create the event";
    if (verb === "DELETE") return "delete the event";
    return "update the event";
  }

  if (/\/challenges\/[^/]+\/participants/.test(cleanPath)) return "load the challenge participants";
  if (/\/challenges\/[^/]+\/join/.test(cleanPath)) return verb === "DELETE" ? "leave the challenge" : "join the challenge";
  if (/\/challenges\/[^/]+\/cancel/.test(cleanPath)) return "cancel the challenge";
  if (/\/challenges\/stats/.test(cleanPath)) return "load the challenge statistics";
  if (/\/challenges/.test(cleanPath)) {
    if (isRead) return "load the challenges";
    if (verb === "POST") return "create the challenge";
    if (verb === "DELETE") return "delete the challenge";
    return "update the challenge";
  }

  if (/\/members\/[^/]+\/permissions/.test(cleanPath)) {
    if (isRead) return "load the team member's permissions";
    return verb === "DELETE" ? "remove the permission" : "grant the permission";
  }
  if (/\/members\/[^/]+\/(?:system-role|custom-role)/.test(cleanPath)) return "assign the role";
  if (/\/members\/[^/]+\/role/.test(cleanPath) && verb === "DELETE") return "remove the role";
  if (/\/members\/[^/]+\/department/.test(cleanPath)) return "assign the team member's department";
  if (/\/members\/[^/]+\/branch/.test(cleanPath)) return "transfer the team member";
  if (/\/members/.test(cleanPath)) return isRead ? "load the team members" : "update the team member";
  if (/\/invites/.test(cleanPath)) {
    if (isRead) return "load the invitations";
    return verb === "DELETE" ? "cancel the invitation" : "send the invitation";
  }

  if (/\/roles\/[^/]+\/permissions/.test(cleanPath)) return "update the role permissions";
  if (/\/roles\/[^/]+\/assign/.test(cleanPath)) return "assign the role";
  if (/\/roles\/[^/]+\/revoke/.test(cleanPath)) return "remove the role";
  if (/\/roles\/[^/]+\/copy/.test(cleanPath)) return "copy the role";
  if (/\/roles/.test(cleanPath)) {
    if (isRead) return "load the roles";
    if (verb === "POST") return "create the role";
    if (verb === "DELETE") return "delete the role";
    return "update the role";
  }
  if (/\/permissions\/catalogue/.test(cleanPath)) return "load the permission list";
  if (/\/permissions\/users\/.+\/grant/.test(cleanPath)) return "grant the permission";
  if (/\/permissions\/users\/.+\/revoke/.test(cleanPath)) return "remove the permission";
  if (/\/permissions/.test(cleanPath)) return isRead ? "load the permissions" : "update the permissions";

  if (/\/clubs\/[^/]+\/members\/[^/]+\/leave/.test(cleanPath)) return "leave the club";
  if (/\/clubs\/[^/]+\/members\/[^/]+/.test(cleanPath) && !isRead) return "join the club";
  if (/\/clubs\/[^/]+\/members/.test(cleanPath)) return "load the club members";
  if (/\/clubs/.test(cleanPath)) {
    if (isRead) return "load the clubs";
    if (verb === "POST") return "create the club";
    if (verb === "DELETE") return "delete the club";
    return "update the club";
  }

  if (/\/messages\/[^/]+\/pin/.test(cleanPath)) return "pin the message";
  if (/\/messages\/[^/]+\/unpin/.test(cleanPath)) return "unpin the message";
  if (/\/messages/.test(cleanPath)) {
    if (isRead) return "load the messages";
    if (verb === "POST") return "send the message";
    if (verb === "DELETE") return "delete the message";
    return "update the message";
  }

  if (/\/posts\/[^/]+\/comments/.test(cleanPath)) {
    if (isRead) return "load the comments";
    return verb === "DELETE" ? "delete the comment" : "add the comment";
  }
  if (/\/posts\/[^/]+\/like/.test(cleanPath)) return verb === "DELETE" ? "remove your reaction" : "add your reaction";
  if (/\/posts/.test(cleanPath)) {
    if (isRead) return "load the posts";
    if (verb === "POST") return "publish the post";
    if (verb === "DELETE") return "delete the post";
    return "update the post";
  }
  if (/\/stories/.test(cleanPath)) {
    if (isRead) return "load the stories";
    if (verb === "POST") return "publish the story";
    if (verb === "DELETE") return "delete the story";
    return "update the story";
  }
  if (/\/hashtags|\/trending/.test(cleanPath)) return "load the trending posts";

  if (/\/storage\/upload-url|\/upload$/.test(cleanPath)) return "prepare the file upload";
  if (/\/wellbeing\/challenges/.test(cleanPath)) return "load the wellbeing challenge templates";
  if (/\/users\/search/.test(cleanPath)) return "search for people";
  if (/\/users\//.test(cleanPath)) return "load the user profile";

  if (/\/integrations\/.+\/connect/.test(cleanPath)) return "connect the integration";
  if (/\/integrations/.test(cleanPath)) {
    if (isRead) return "load the integrations";
    if (verb === "DELETE") return "disconnect the integration";
    return "update the integration";
  }

  if (/\/plans$/.test(cleanPath)) return "load the subscription plans";
  if (/\/checkout/.test(cleanPath)) return "start checkout";
  if (/\/transactions\/[^/]+\/verify/.test(cleanPath)) return "verify the payment";
  if (/\/transactions\//.test(cleanPath)) return "load the payment details";
  if (/\/transactions/.test(cleanPath)) return "load the payment history";
  if (/\/subscription\/cancel-auto-renew/.test(cleanPath)) return "turn off automatic renewal";
  if (/\/subscription\/auto-renew/.test(cleanPath)) return "update automatic renewal";
  if (/\/subscription/.test(cleanPath)) return "load the subscription";

  if (/\/user-settings\/profile/.test(cleanPath)) return isRead ? "load your profile" : "save your profile";
  if (/\/user-settings\/avatar/.test(cleanPath)) return "update your profile photo";
  if (/\/user-settings\/preferences/.test(cleanPath)) return isRead ? "load your preferences" : "save your preferences";
  if (/\/user-settings\/change-password/.test(cleanPath)) return "change your password";

  if (/\/notifications\/read-all/.test(cleanPath)) return "mark all notifications as read";
  if (/\/notifications\/unread-count/.test(cleanPath)) return "load the notification count";
  if (/\/notifications\/.+\/read/.test(cleanPath)) return "mark the notification as read";
  if (/\/notifications/.test(cleanPath)) return isRead ? "load the notifications" : verb === "DELETE" ? "delete the notification" : "update the notification";

  if (/\/public\/demo-requests/.test(cleanPath)) return "send the demo request";
  if (/\/support\/tickets/.test(cleanPath)) return "send your support request";
  if (/\/api\/ai\/chat/.test(cleanPath)) return "send your message to the wellbeing assistant";

  if (/\/v1\/[^/]+\/upload/.test(cleanPath)) return "upload the file";
  const resource = cleanPath.match(/\/v1\/([^/]+)/)?.[1]?.replace(/[-_]+/g, " ");
  if (resource) {
    if (isRead) return `load the ${resource}`;
    if (verb === "DELETE") return `delete the ${resource} item`;
    return `save the ${resource} changes`;
  }
  return isRead ? "load this information" : "complete that action";
}

function subjectForRequest(path: string): string | null {
  const cleanPath = path.toLowerCase().split("?")[0];
  const subjects: Array<[RegExp, string]> = [
    [/\/branches/, "branch"],
    [/\/departments/, "department"],
    [/\/events/, "event"],
    [/\/challenges/, "challenge"],
    [/\/clubs/, "club"],
    [/\/posts/, "post"],
    [/\/stories/, "story"],
    [/\/messages/, "message"],
    [/\/roles/, "role"],
    [/\/members|\/users\//, "team member"],
    [/\/invites/, "invitation"],
    [/\/integrations/, "integration"],
    [/\/notifications/, "notification"],
    [/\/subscription|\/transactions/, "payment record"],
  ];
  return subjects.find(([pattern]) => pattern.test(cleanPath))?.[1] ?? null;
}

export function getRequestErrorMessage(path: string, method = "GET", status = 0): string {
  const action = actionForRequest(path, method);
  const subject = subjectForRequest(path);

  if (status === 404 && subject) return `We couldn't find this ${subject}.`;
  if (status === 409 && subject) {
    if (["branch", "department", "club", "role"].includes(subject)) {
      return `A ${subject} with these details already exists.`;
    }
    if (subject === "integration") return "This integration is already connected.";
    return `This ${subject} already exists or has already been updated.`;
  }
  if (status === 408 || status === 504) return `We couldn't ${action} in time. Try again.`;
  if (status === 0) return `We couldn't ${action}. Check your internet and try again.`;
  return `We couldn't ${action}. Try again.`;
}

const TECHNICAL_MESSAGE = /(?:\b(?:api|backend|database|exception|stack|traceback|undefined|null|syntax|json|fetch|upstream|internal server|status code|request failed|econn|enotfound|etimedout)\b|[{}<>]|https?:\/\/|\w+Error\b|\b[A-Z][A-Z0-9_]{3,}\b)/i;
const USER_FACING_MESSAGE = /^(?:we couldn't|this |that |your |please |you don't|an? .+ already|too many|payment )/i;

function normalizeCode(code?: string) {
  return code?.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function cleanMessage(message: string) {
  return message.replace(/^value error[:,]?\s*/i, "").replace(/\s+/g, " ").trim();
}

function isSafeMessage(message: string) {
  const clean = cleanMessage(message);
  return clean.length >= 3 && clean.length <= 140 && !TECHNICAL_MESSAGE.test(clean);
}

function messageFromKnownText(message: string): string | null {
  const text = message.toLowerCase();

  if (/current password.*(invalid|incorrect|wrong)|invalid current password/.test(text)) {
    return "Your current password is incorrect.";
  }
  if (/(invalid|incorrect|wrong).*(email|password)|(email|password).*(invalid|incorrect|wrong)/.test(text)) {
    return "Email or password is incorrect.";
  }
  if (/(invalid|incorrect|wrong|expired).*(otp|verification code|code)|(otp|verification code).*(invalid|incorrect|wrong|expired)/.test(text)) {
    return "That verification code is invalid or expired.";
  }
  if (/(invite|invitation).*(invalid|expired|not found)/.test(text)) {
    return "This invitation is invalid or expired.";
  }
  if (/(phone|mobile|telephone).*(already|exists|registered|in use|used)|already.*(phone|mobile|telephone)/.test(text)) {
    return "This phone number is already in use.";
  }
  if (/business name.*(already|exists|registered|in use|used)|already.*business name/.test(text)) {
    return "This business name is already in use.";
  }
  if (/(email|account|user).*(already|exists|registered)|already.*(email|account|user)/.test(text)) {
    return "An account already uses this email.";
  }
  if (/(invalid|valid).*(phone|mobile|telephone)|(phone|mobile|telephone).*(invalid|not valid)/.test(text)) return "Enter a valid phone number.";
  if (/file.*(too large|size)|payload too large/.test(text)) return "This file is too large.";
  if (/(unsupported|invalid).*(file|media|image|video).*(type|format)|unsupported media/.test(text)) {
    return "This file type isn't supported.";
  }
  if (/not found|does not exist/.test(text)) return "We couldn't find what you requested.";
  if (/rate limit|too many (requests|attempts)/.test(text)) return STATUS_MESSAGES[429];
  if (/timed? out|timeout/.test(text)) return "That took too long. Try again.";
  if (/network|failed to fetch|unable to connect|connection/.test(text)) {
    return CODE_MESSAGES.NETWORK_ERROR;
  }

  return null;
}

export function getApiErrorMessage(
  status: number,
  code?: string,
  rawMessage = "",
  requestMessage?: string,
): string {
  const normalizedCode = normalizeCode(code);
  if (normalizedCode && DEDICATED_ERROR_CODES.has(normalizedCode)) return CODE_MESSAGES[normalizedCode];

  const knownText = messageFromKnownText(rawMessage);
  if (knownText) return knownText;

  if (status === 403) {
    const permission = permissionFromError(rawMessage);
    return permission ? permissionDeniedMessage(permission) : STATUS_MESSAGES[403];
  }

  if (status === 400 || status === 422) {
    const clean = cleanMessage(rawMessage);
    if (isSafeMessage(clean)) return clean;
  }

  if (status === 401 || status === 402 || status === 408 || status === 413 || status === 415 || status === 429) {
    return STATUS_MESSAGES[status];
  }

  if (requestMessage) return requestMessage;
  if (normalizedCode && CODE_MESSAGES[normalizedCode]) return CODE_MESSAGES[normalizedCode];

  return STATUS_MESSAGES[status] ?? DEFAULT_ERROR_MESSAGE;
}

export function getUserErrorMessage(error: unknown, fallback = DEFAULT_ERROR_MESSAGE): string {
  if (error && typeof error === "object") {
    const details = error as ErrorDetails;
    if (
      typeof details.message === "string"
      && USER_FACING_MESSAGE.test(details.message)
      && isSafeMessage(details.message)
    ) {
      return cleanMessage(details.message);
    }
    if (typeof details.status === "number") {
      return getApiErrorMessage(details.status, details.code, details.message);
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      return CODE_MESSAGES.REQUEST_TIMEOUT;
    }
    if (error instanceof TypeError) return CODE_MESSAGES.NETWORK_ERROR;
    if (typeof details.message === "string") {
      const knownText = messageFromKnownText(details.message);
      if (knownText) return knownText;
      if (isSafeMessage(details.message)) return cleanMessage(details.message);
    }
  }

  return isSafeMessage(fallback) ? cleanMessage(fallback) : DEFAULT_ERROR_MESSAGE;
}

function fieldLabel(field?: string) {
  if (!field || field === "form") return "This field";
  return field.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getFieldErrorMessage(message: string, field?: string): string {
  const clean = cleanMessage(message);
  const text = clean.toLowerCase();
  const label = fieldLabel(field);

  if (/field required|required field|input should be present/.test(text)) return `${label} is required.`;
  if (/(phone|mobile|telephone).*(already|exists|registered|in use|used)|already.*(phone|mobile|telephone)/.test(text)) {
    return "This phone number is already in use.";
  }
  if (/business name.*(already|exists|registered|in use|used)|already.*business name/.test(text)) {
    return "This business name is already in use.";
  }
  if (/email.*(already|exists|registered|in use|used)|already.*email/.test(text)) {
    return "An account already uses this email.";
  }
  if (/valid email|email address/.test(text)) return "Enter a valid email address.";
  if (/(invalid|valid).*(phone|mobile|telephone)|(phone|mobile|telephone).*(invalid|not valid)/.test(text)) {
    return "Enter a valid phone number.";
  }
  if (/at least \d+ characters|too short|min(?:imum)? length/.test(text)) return `${label} is too short.`;
  if (/at most \d+ characters|too long|max(?:imum)? length/.test(text)) return `${label} is too long.`;
  const dateOrTime = text.match(/valid (date|time)/)?.[1];
  if (dateOrTime) return `Enter a valid ${dateOrTime}.`;
  if (/valid (number|integer)/.test(text)) return "Enter a valid number.";
  if (isSafeMessage(clean)) return clean;
  return `Check ${label.toLowerCase()}.`;
}

export function getFriendlyFieldErrors(
  errors?: Record<string, string[]>,
): Record<string, string[]> | undefined {
  if (!errors) return undefined;
  const entries = Object.entries(errors)
    .filter(([, messages]) => Array.isArray(messages) && messages.length > 0)
    .map(([field, messages]) => [
      field,
      messages.map((message) => getFieldErrorMessage(String(message), field)),
    ] as const);
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
}
