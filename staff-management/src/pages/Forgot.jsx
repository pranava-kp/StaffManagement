import React from 'react'
import Template from "../components/core/Auth/Template"
import ForgotPassword from "../components/core/Auth/ForgotPassword"

const forgotPassword = () => {
    return (
        <Template
          title="Reset Your Password"
          description="Enter your email to receive a password reset link"
          formType="forgot-password"
          //form={<ForgotPassword />}
        />
    )
}

export default ForgotPassword;