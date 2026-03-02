import React from "react"

export interface InputField {
    id?: string
    label: string
    type?: string
    value?: string
    disabled?: boolean
    required?: boolean
    className?: string
    placeholder?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}