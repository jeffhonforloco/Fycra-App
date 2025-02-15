package com.fycra.app.util

import android.content.Context
import android.os.Build
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import com.google.android.play.core.integrity.IntegrityManagerFactory
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecurityManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val biometricManager = BiometricManager.from(context)
    private val integrityManager = IntegrityManagerFactory.create(context)

    fun performSecurityChecks() {
        if (isDeviceRooted()) {
            throw SecurityException("Device is rooted")
        }

        if (isRunningInEmulator()) {
            throw SecurityException("Running in emulator")
        }

        if (isDebuggerConnected()) {
            throw SecurityException("Debugger detected")
        }
    }

    fun canUseBiometrics(): Boolean {
        return biometricManager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) ==
            BiometricManager.BIOMETRIC_SUCCESS
    }

    private fun isDeviceRooted(): Boolean {
        // Implement root detection
        return false
    }

    private fun isRunningInEmulator(): Boolean {
        return Build.FINGERPRINT.startsWith("generic") ||
            Build.FINGERPRINT.startsWith("unknown") ||
            Build.MODEL.contains("google_sdk") ||
            Build.MODEL.contains("Emulator") ||
            Build.MODEL.contains("Android SDK built for x86")
    }

    private fun isDebuggerConnected(): Boolean {
        return android.os.Debug.isDebuggerConnected()
    }
}