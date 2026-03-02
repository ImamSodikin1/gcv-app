import React from "react"
import { InputField } from "@/interface/components/InputField"

const Input: React.FC<InputField> = ({ label, type = 'text', id, value, disabled, required, className, placeholder, onChange }) => {
    return (
        <div className="mb-4">
            <label
                htmlFor={id}
                className="block text-sm font-medium mb-1"
            >
                {label}
            </label>

            <input
                type={type}
                id={id}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className={`${className} border w-full px-3 py-2 rounded-sm shadow-sm`}
            />
        </div>
    )
}

export default Input