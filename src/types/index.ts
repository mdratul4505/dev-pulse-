 export const USER_ROLE = {
    contributor : "contributor",
    maintainer : "maintainer"
} as const

export type ROLES = typeof USER_ROLE[keyof typeof USER_ROLE]