import "server-only";

import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export const JOB_ASSISTANT_COOKIE = "placement_desk_session";
export const JOB_ASSISTANT_SESSION_SECONDS = 60 * 60 * 24 * 7;

type InviteRecord = {
    id: string;
    label: string;
    isOwner: boolean;
    passwordHash: string;
};

export type PublicInvite = Omit<InviteRecord, "passwordHash">;

const INVITES: InviteRecord[] = [
    {
        id: "Icey",
        label: "Icey",
        isOwner: false,
        passwordHash: "e158342d9f0cebd01c407dd7001a9efb:b98ef43ba59e2296bf8f84d11ed96520f5e05d45f215c5db6cd672d342fc342d1e07045021b7f7cc7a0b37cfca5129f40fcae5f6b0bdee6446d99b2ffbab3640",
    },
    {
        id: "Mika",
        label: "Mika",
        isOwner: false,
        passwordHash: "110784a4c7ba75def0b0aac04765a3d9:1d8884740190ff74ac0e81a6a644aaae73a1c039f15bcfd9bca20d3223a57ade6fe073f3fa8e5d974595a6744b32f1790abfe5d46e18b245a2ac7b86ec5850db",
    },
    {
        id: "Naala",
        label: "Naala",
        isOwner: false,
        passwordHash: "6fbb85b5a1e074026ce742301f00dab5:861487b5613349520615406ccab58fdb2f616f11b4e6a72681a65f044452cdb105a656d5751b575510985c0cab4982ab2d0a0d460bf15855666778fe49670266",
    },
    {
        id: "Simba",
        label: "Simba",
        isOwner: false,
        passwordHash: "beaac19973f0fecb2ddcdb2980008608:7508ed32bc4403ad6d4b31a865e6c255a7d76dbd0530a2c07e7470f86e226e8079ed09cca02fa8373a045f10bb16ee135d3283da313aada351366bf0b80d413a",
    },
    {
        id: "Samsy",
        label: "Samsy",
        isOwner: false,
        passwordHash: "d602dc4f1b3de9d24314c34f721f0610:f8112705adc6662eb24c7893568b0f24e41ff410bfe2f52df55d83a13763c00b1b034f149f605d234ebe972cbd36b295d1db931bdcb96f95f3017166009f90fe",
    },
    {
        id: "Sara",
        label: "Sara",
        isOwner: false,
        passwordHash: "df690935836500607232ba3c1f64e747:58f34ee360d059014df1404769543126c090d71d8fd2976a8ffb5c2ff39cd5844b4d2a9ca8792b634eed709a5b50bc8816a68f95e7c7bfca4ac8d75c937271f8",
    },
    {
        id: "Stephie",
        label: "Stephie",
        isOwner: false,
        passwordHash: "95f48cef9c0f90328dc0244ab564a6ca:10ee9c987f8239db755e398c1a142e97ba1dff53032f61780eae89250e292d586c8711af81393d60c5b25a16ec7f2929536b2e967f46f600d3f5cbc23f02d105",
    },
    {
        id: "Diana",
        label: "Diana",
        isOwner: false,
        passwordHash: "9feeb378bf9882168f8bddc45535a7d5:423e54c91cd5a3b0f4053f873f5c9de12d35b101b6490502df7641c6f20385513d84f700c5d4790382a7fe2291e4881eecd8a04e3f23aac7dc5fd5453d97b357",
    },
    {
        id: "Johnny",
        label: "Johnny",
        isOwner: false,
        passwordHash: "cd6eb5037ed6c62f9a51a28f396c561c:1260ea9996e536e0bcdc49e48975d1515ea04ccbebb2520b1ac296b4674fe456ff637f6f1d4a97a526f253125fc7ace6551e924f6b1337cbd35ef183745cd29e",
    },
    {
        id: "Yusuf",
        label: "Yusuf",
        isOwner: true,
        passwordHash: "2c3bb72ec2ef9dce88df33c628d3b02a:52c27bd1b8b20eca089d92e23ced4f67c408e6bc0132f9c9e2ba6d13e3274b660d940563fc175bc7a53d9977dd95c46af1d7a718edeae857fa37a3b8e2380bc9",
    },
];

const DEVELOPMENT_SESSION_SECRET =
    "de7c28ff21dc144fcfda68b733281fe3d4699d8f01327e1f5158a5feeedc6d7e9eca016a444a9d1a97c54b46d5bb18bd";

function publicInvite(invite: InviteRecord): PublicInvite {
    return {
        id: invite.id,
        label: invite.label,
        isOwner: invite.isOwner,
    };
}

function getSessionSecret(): string | null {
    const configuredSecret = process.env.JOB_ASSISTANT_SESSION_SECRET?.trim();
    if (configuredSecret && configuredSecret.length >= 32) return configuredSecret;
    return process.env.NODE_ENV === "production" ? null : DEVELOPMENT_SESSION_SECRET;
}

export function isJobAssistantSessionConfigured(): boolean {
    return getSessionSecret() !== null;
}

function sign(value: string): string {
    const secret = getSessionSecret();
    if (!secret) throw new Error("Job assistant session signing is not configured.");
    return createHmac("sha256", secret).update(value).digest("base64url");
}

export function getInviteById(id: string): PublicInvite | null {
    const invite = INVITES.find((candidate) => candidate.id.toLowerCase() === id.trim().toLowerCase());
    return invite ? publicInvite(invite) : null;
}

export function authenticateInvite(id: string, password: string): PublicInvite | null {
    const invite = INVITES.find((candidate) => candidate.id.toLowerCase() === id.trim().toLowerCase());
    if (!invite || !password || password.length > 128) return null;

    const [salt, encodedHash] = invite.passwordHash.split(":");
    if (!salt || !encodedHash) return null;

    const suppliedHash = scryptSync(password, salt, 64);
    const expectedHash = Buffer.from(encodedHash, "hex");

    if (suppliedHash.length !== expectedHash.length || !timingSafeEqual(suppliedHash, expectedHash)) {
        return null;
    }

    return publicInvite(invite);
}

export function createSessionToken(inviteId: string): string {
    const payload = Buffer.from(
        JSON.stringify({
            inviteId,
            expiresAt: Date.now() + JOB_ASSISTANT_SESSION_SECONDS * 1000,
        }),
    ).toString("base64url");

    return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): PublicInvite | null {
    if (!token) return null;

    try {
        const [payload, suppliedSignature, extra] = token.split(".");
        if (!payload || !suppliedSignature || extra) return null;

        const expectedSignature = Buffer.from(sign(payload));
        const receivedSignature = Buffer.from(suppliedSignature);
        if (
            expectedSignature.length !== receivedSignature.length ||
            !timingSafeEqual(expectedSignature, receivedSignature)
        ) {
            return null;
        }

        const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
            inviteId?: unknown;
            expiresAt?: unknown;
        };
        if (
            typeof parsed.inviteId !== "string" ||
            typeof parsed.expiresAt !== "number" ||
            parsed.expiresAt <= Date.now()
        ) {
            return null;
        }

        return getInviteById(parsed.inviteId);
    } catch {
        return null;
    }
}