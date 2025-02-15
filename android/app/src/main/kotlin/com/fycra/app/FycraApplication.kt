package com.fycra.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import com.fycra.app.util.SecurityManager
import javax.inject.Inject

@HiltAndroidApp
class FycraApplication : Application() {
    @Inject
    lateinit var securityManager: SecurityManager

    override fun onCreate() {
        super.onCreate()
        setupSecurity()
    }

    private fun setupSecurity() {
        securityManager.performSecurityChecks()
    }
}