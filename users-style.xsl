<?xml version="1.0" encoding="UTF-8"?>
<!-- ============================================
     KAKAMPI · Lipa City Fire Rescue
     User.XSL - XSLT Stylesheet for users.xml
     Transforms XML user data into HTML view
     Bright Edition + Clickable Stats
     ============================================ -->
<xsl:stylesheet version="1.0" 
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    
    <xsl:output method="html" indent="yes" encoding="UTF-8"/>
    
    <!-- ===== MAIN TEMPLATE ===== -->
    <xsl:template match="/kakampi_users">
        <html lang="en">
            <head>
                <meta charset="UTF-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <title>KAKAMPI · User Management Dashboard</title>
                <style>
                    <xsl:comment>
                        /* Kakampi XSLT Styling */
                        :root {
                            --orange: #f97316;
                            --red: #dc2626;
                            --dark-red: #b91c1c;
                            --cream: #fff7ed;
                            --warm: #ffedd5;
                            --light: #fef3c7;
                            --border: #fdba74;
                            --text-dark: #431407;
                            --text-warm: #9a3412;
                            --text-orange: #c2410c;
                            --white: #ffffff;
                            --success: #10b981;
                            --warning: #f59e0b;
                            --danger: #ef4444;
                        }
                        
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        
                        body {
                            font-family: 'Segoe UI', system-ui, sans-serif;
                            background: linear-gradient(135deg, var(--orange) 0%, var(--red) 50%, var(--dark-red) 100%);
                            min-height: 100vh;
                            padding: 20px;
                        }
                        
                        .container {
                            max-width: 900px;
                            margin: 0 auto;
                        }
                        
                        .header {
                            background: rgba(255,255,255,0.95);
                            border-radius: 2rem;
                            padding: 24px 32px;
                            margin-bottom: 20px;
                            border: 2px solid #ffdd99;
                            text-align: center;
                        }
                        
                        .header h1 {
                            background: linear-gradient(135deg, #ea580c, var(--red), var(--orange));
                            -webkit-background-clip: text;
                            background-clip: text;
                            color: transparent;
                            font-size: 2rem;
                            font-weight: 900;
                        }
                        
                        .header .subtitle {
                            color: #b45309;
                            font-size: 0.85rem;
                            margin-top: 8px;
                        }
                        
                        .stats-bar {
                            display: flex;
                            gap: 12px;
                            flex-wrap: wrap;
                            margin-bottom: 20px;
                        }
                        
                        .stat-card {
                            flex: 1;
                            min-width: 150px;
                            background: var(--cream);
                            border-radius: 1.5rem;
                            padding: 16px 20px;
                            border: 2px solid var(--border);
                            text-align: center;
                        }
                        
                        .stat-card .stat-number {
                            font-size: 2rem;
                            font-weight: 900;
                            color: var(--text-orange);
                        }
                        
                        .stat-card .stat-label {
                            font-size: 0.75rem;
                            color: var(--text-warm);
                            font-weight: 600;
                        }
                        
                        .role-breakdown {
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                            justify-content: center;
                            margin-bottom: 20px;
                        }
                        
                        .role-pill {
                            padding: 6px 16px;
                            border-radius: 30px;
                            font-size: 0.75rem;
                            font-weight: 700;
                            color: white;
                        }
                        
                        .role-pill.resident { background: var(--success); }
                        .role-pill.responder { background: var(--warning); }
                        .role-pill.bfp { background: var(--danger); }
                        
                        .user-card {
                            background: var(--cream);
                            border-radius: 1.5rem;
                            padding: 20px;
                            margin-bottom: 16px;
                            border-left: 8px solid var(--orange);
                            border-top: 1px solid var(--border);
                            border-right: 1px solid var(--border);
                            border-bottom: 1px solid var(--border);
                            transition: transform 0.2s;
                        }
                        
                        .user-card:hover {
                            transform: translateX(4px);
                            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                        }
                        
                        .user-card-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            flex-wrap: wrap;
                            gap: 10px;
                            margin-bottom: 12px;
                        }
                        
                        .user-name {
                            font-size: 1.1rem;
                            font-weight: 800;
                            color: var(--text-orange);
                        }
                        
                        .user-role-badge {
                            display: inline-block;
                            padding: 4px 12px;
                            border-radius: 20px;
                            font-size: 0.7rem;
                            font-weight: 700;
                            color: white;
                            background: var(--orange);
                        }
                        
                        .user-role-badge.Resident { background: var(--success); }
                        .user-role-badge.Responder { background: var(--warning); }
                        .user-role-badge.BFP_Personnel { background: var(--danger); }
                        
                        .user-details {
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                            gap: 8px;
                            font-size: 0.8rem;
                        }
                        
                        .detail-item {
                            display: flex;
                            gap: 6px;
                            align-items: center;
                        }
                        
                        .detail-label {
                            font-weight: 700;
                            color: var(--text-warm);
                            min-width: 80px;
                        }
                        
                        .detail-value {
                            color: var(--text-dark);
                            font-family: monospace;
                        }
                        
                        .permissions-grid {
                            display: flex;
                            gap: 8px;
                            flex-wrap: wrap;
                            margin-top: 8px;
                        }
                        
                        .perm-badge {
                            padding: 2px 10px;
                            border-radius: 12px;
                            font-size: 0.65rem;
                            font-weight: 600;
                        }
                        
                        .perm-true {
                            background: #dcfce7;
                            color: #15803d;
                        }
                        
                        .perm-false {
                            background: #fee2e2;
                            color: #b91c1c;
                        }
                        
                        .equipment-list {
                            display: flex;
                            gap: 6px;
                            flex-wrap: wrap;
                            margin-top: 8px;
                        }
                        
                        .equipment-tag {
                            background: var(--light);
                            padding: 3px 10px;
                            border-radius: 12px;
                            font-size: 0.7rem;
                            border: 1px solid var(--border);
                            color: var(--text-warm);
                        }
                        
                        .bfp-details {
                            margin-top: 8px;
                            padding: 8px 12px;
                            background: #fef2f2;
                            border-radius: 12px;
                            border: 1px dashed #fca5a5;
                        }
                        
                        .footer {
                            text-align: center;
                            color: white;
                            margin-top: 20px;
                            font-size: 0.7rem;
                            opacity: 0.9;
                        }
                        
                        .no-users {
                            text-align: center;
                            padding: 40px;
                            background: var(--cream);
                            border-radius: 1.5rem;
                            color: #b45309;
                            font-style: italic;
                        }
                        
                        @media (max-width: 600px) {
                            .header { padding: 16px; }
                            .header h1 { font-size: 1.5rem; }
                            .user-details { grid-template-columns: 1fr; }
                        }
                    </xsl:comment>
                </style>
            </head>
            <body>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>🔥 KAKAMPI · User Management</h1>
                        <div class="subtitle">
                            <xsl:value-of select="system_info/name"/> · 
                            Version <xsl:value-of select="system_info/version"/> · 
                            <xsl:value-of select="system_info/total_users"/> Registered Users
                        </div>
                    </div>
                    
                    <!-- Statistics Bar -->
                    <div class="stats-bar">
                        <div class="stat-card">
                            <div class="stat-number">
                                <xsl:value-of select="count(users/user)"/>
                            </div>
                            <div class="stat-label">👥 Total Users</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <xsl:value-of select="count(users/user[role='Resident'])"/>
                            </div>
                            <div class="stat-label">🏠 Residents</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <xsl:value-of select="count(users/user[role='Responder'])"/>
                            </div>
                            <div class="stat-label">🚒 Responders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">
                                <xsl:value-of select="count(users/user[role='BFP Personnel'])"/>
                            </div>
                            <div class="stat-label">👨‍🚒 BFP Personnel</div>
                        </div>
                    </div>
                    
                    <!-- Role Breakdown -->
                    <div class="role-breakdown">
                        <span class="role-pill resident">
                            🏠 Residents: <xsl:value-of select="count(users/user[role='Resident'])"/>
                        </span>
                        <span class="role-pill responder">
                            🚒 Responders: <xsl:value-of select="count(users/user[role='Responder'])"/>
                        </span>
                        <span class="role-pill bfp">
                            👨‍🚒 BFP: <xsl:value-of select="count(users/user[role='BFP Personnel'])"/>
                        </span>
                    </div>
                    
                    <!-- User Cards -->
                    <xsl:choose>
                        <xsl:when test="count(users/user) > 0">
                            <xsl:for-each select="users/user">
                                <xsl:sort select="role" order="descending"/>
                                <xsl:sort select="fullname"/>
                                
                                <div class="user-card">
                                    <!-- User Card Header -->
                                    <div class="user-card-header">
                                        <span class="user-name">
                                            <xsl:choose>
                                                <xsl:when test="role='Resident'">🏠 </xsl:when>
                                                <xsl:when test="role='Responder'">🚒 </xsl:when>
                                                <xsl:when test="role='BFP Personnel'">👨‍🚒 </xsl:when>
                                                <xsl:otherwise>👤 </xsl:otherwise>
                                            </xsl:choose>
                                            <xsl:value-of select="fullname"/>
                                        </span>
                                        <span class="user-role-badge">
                                            <xsl:attribute name="class">
                                                <xsl:text>user-role-badge </xsl:text>
                                                <xsl:choose>
                                                    <xsl:when test="role='BFP Personnel'">BFP_Personnel</xsl:when>
                                                    <xsl:otherwise><xsl:value-of select="role"/></xsl:otherwise>
                                                </xsl:choose>
                                            </xsl:attribute>
                                            <xsl:value-of select="role"/>
                                        </span>
                                    </div>
                                    
                                    <!-- User Details -->
                                    <div class="user-details">
                                        <div class="detail-item">
                                            <span class="detail-label">📧 Username:</span>
                                            <span class="detail-value">@<xsl:value-of select="username"/></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">📍 Barangay:</span>
                                            <span class="detail-value"><xsl:value-of select="barangay"/></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">📞 Contact:</span>
                                            <span class="detail-value">
                                                <xsl:value-of select="contact"/>
                                                <xsl:if test="contact='' or not(contact)">No contact provided</xsl:if>
                                            </span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">📅 Joined:</span>
                                            <span class="detail-value"><xsl:value-of select="created_at"/></span>
                                        </div>
                                        <div class="detail-item">
                                            <span class="detail-label">🔑 Status:</span>
                                            <span class="detail-value" style="color:#15803d; font-weight:700;">
                                                ● <xsl:value-of select="status"/>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- Permissions -->
                                    <div style="margin-top: 10px;">
                                        <strong style="font-size:0.75rem; color:#c2410c;">🔐 Permissions:</strong>
                                        <div class="permissions-grid">
                                            <span class="perm-badge">
                                                <xsl:attribute name="class">perm-badge perm-<xsl:value-of select="permissions/can_report_fire"/></xsl:attribute>
                                                📢 Report Fire: <xsl:value-of select="permissions/can_report_fire"/>
                                            </span>
                                            <span class="perm-badge">
                                                <xsl:attribute name="class">perm-badge perm-<xsl:value-of select="permissions/can_call_hotlines"/></xsl:attribute>
                                                📞 Call Hotlines: <xsl:value-of select="permissions/can_call_hotlines"/>
                                            </span>
                                            <span class="perm-badge">
                                                <xsl:attribute name="class">perm-badge perm-<xsl:value-of select="permissions/can_dispatch_responders"/></xsl:attribute>
                                                🚒 Dispatch: <xsl:value-of select="permissions/can_dispatch_responders"/>
                                            </span>
                                            <span class="perm-badge">
                                                <xsl:attribute name="class">perm-badge perm-<xsl:value-of select="permissions/can_manage_system"/></xsl:attribute>
                                                ⚙️ Manage System: <xsl:value-of select="permissions/can_manage_system"/>
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <!-- Response Team (Responders only) -->
                                    <xsl:if test="response_team">
                                        <div style="margin-top: 10px;">
                                            <strong style="font-size:0.75rem; color:#c2410c;">🚒 Response Team:</strong>
                                            <div style="font-size:0.75rem; color:#78350f; margin-top:4px;">
                                                <strong><xsl:value-of select="response_team/team_name"/></strong> · 
                                                Unit: <xsl:value-of select="response_team/unit"/>
                                            </div>
                                            <div class="equipment-list">
                                                <xsl:for-each select="response_team/equipment/item">
                                                    <span class="equipment-tag">🔧 <xsl:value-of select="."/></span>
                                                </xsl:for-each>
                                            </div>
                                        </div>
                                    </xsl:if>
                                    
                                    <!-- BFP Details (BFP Personnel only) -->
                                    <xsl:if test="bfp_details">
                                        <div class="bfp-details">
                                            <strong style="font-size:0.75rem; color:#b91c1c;">👨‍🚒 BFP Details:</strong>
                                            <div style="font-size:0.7rem; color:#78350f; margin-top:4px;">
                                                <div>🎖️ Rank: <strong><xsl:value-of select="bfp_details/rank"/></strong></div>
                                                <div>🪪 Badge: <strong><xsl:value-of select="bfp_details/badge_number"/></strong></div>
                                                <div>🏢 Station: <xsl:value-of select="bfp_details/station"/></div>
                                                <div>🔧 Specialization: <xsl:value-of select="bfp_details/specialization"/></div>
                                            </div>
                                        </div>
                                    </xsl:if>
                                </div>
                            </xsl:for-each>
                        </xsl:when>
                        <xsl:otherwise>
                            <div class="no-users">
                                <p style="font-size:1.5rem;">📭</p>
                                <p>No registered users found.</p>
                                <p style="font-size:0.75rem;">Register a new account to get started.</p>
                            </div>
                        </xsl:otherwise>
                    </xsl:choose>
                    
                    <!-- Roles Summary -->
                    <div style="background:var(--cream); border-radius:1.5rem; padding:20px; margin-top:20px; border:1px solid var(--border);">
                        <h3 style="color:#c2410c; margin-bottom:12px; font-size:1rem;">📋 Role Definitions</h3>
                        <xsl:for-each select="roles/role">
                            <div style="margin-bottom:12px; padding:10px; background:white; border-radius:12px; border-left:4px solid #f97316;">
                                <strong style="color:#9a3412;">
                                    <xsl:choose>
                                        <xsl:when test="@name='Resident'">🏠 </xsl:when>
                                        <xsl:when test="@name='Responder'">🚒 </xsl:when>
                                        <xsl:when test="@name='BFP Personnel'">👨‍🚒 </xsl:when>
                                    </xsl:choose>
                                    <xsl:value-of select="@name"/>
                                </strong>
                                <span style="font-size:0.65rem; background:#f97316; color:white; padding:2px 8px; border-radius:12px; margin-left:8px;">
                                    Level <xsl:value-of select="access_level"/>
                                </span>
                                <p style="font-size:0.75rem; color:#78350f; margin-top:4px;">
                                    <xsl:value-of select="description"/>
                                </p>
                                <div style="font-size:0.7rem; color:#b45309; margin-top:4px;">
                                    <strong>Capabilities:</strong>
                                    <xsl:for-each select="capabilities/capability">
                                        <span style="display:inline-block; background:#fef3c7; padding:2px 8px; border-radius:10px; margin:2px;">
                                            ✓ <xsl:value-of select="."/>
                                        </span>
                                    </xsl:for-each>
                                </div>
                            </div>
                        </xsl:for-each>
                    </div>
                    
                    <!-- Barangays -->
                    <div style="background:var(--cream); border-radius:1.5rem; padding:20px; margin-top:20px; border:1px solid var(--border);">
                        <h3 style="color:#c2410c; margin-bottom:12px; font-size:1rem;">📍 Barangays</h3>
                        <xsl:for-each select="barangays/barangay">
                            <div style="display:inline-block; background:white; padding:8px 16px; border-radius:20px; margin:4px; border:1px solid var(--border); font-size:0.75rem;">
                                <strong style="color:#9a3412;"><xsl:value-of select="@name"/></strong>
                                <span style="color:#78350f; margin-left:8px;">
                                    📍 <xsl:value-of select="district"/>
                                </span>
                                <span style="color:#78350f; margin-left:8px;">
                                    👥 <xsl:value-of select="population"/>
                                </span>
                                <span style="margin-left:8px;">
                                    <xsl:choose>
                                        <xsl:when test="fire_risk_level='high'">🔴</xsl:when>
                                        <xsl:when test="fire_risk_level='moderate'">🟡</xsl:when>
                                        <xsl:when test="fire_risk_level='low'">🟢</xsl:when>
                                        <xsl:otherwise>⚪</xsl:otherwise>
                                    </xsl:choose>
                                    <xsl:value-of select="fire_risk_level"/>
                                </span>
                            </div>
                        </xsl:for-each>
                    </div>
                    
                    <!-- Registration Settings -->
                    <div style="background:var(--cream); border-radius:1.5rem; padding:20px; margin-top:20px; border:1px solid var(--border);">
                        <h3 style="color:#c2410c; margin-bottom:12px; font-size:1rem;">⚙️ Registration Settings</h3>
                        <div style="font-size:0.8rem; color:#78350f;">
                            <p>🔒 Minimum Password Length: <strong><xsl:value-of select="registration_settings/minimum_password_length"/></strong></p>
                            <p>✅ Required Fields: 
                                <xsl:for-each select="registration_settings/required_fields/field">
                                    <span style="background:#fef3c7; padding:2px 8px; border-radius:10px; margin:2px;">
                                        <xsl:value-of select="."/>
                                    </span>
                                </xsl:for-each>
                            </p>
                            <p>⚪ Optional Fields: 
                                <xsl:for-each select="registration_settings/optional_fields/field">
                                    <span style="background:#fef3c7; padding:2px 8px; border-radius:10px; margin:2px;">
                                        <xsl:value-of select="."/>
                                    </span>
                                </xsl:for-each>
                            </p>
                            <p>📝 Username: 
                                Unique: <strong><xsl:value-of select="registration_settings/username_policy/unique"/></strong> · 
                                Min: <strong><xsl:value-of select="registration_settings/username_policy/min_length"/></strong> · 
                                Max: <strong><xsl:value-of select="registration_settings/username_policy/max_length"/></strong>
                            </p>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer">
                        🔥 KAKAMPI · Lipa City Fire Rescue · User Management System<br/>
                        Generated: <xsl:value-of select="system_info/last_updated"/> · 
                        Storage: <xsl:value-of select="system_info/storage_type"/>
                    </div>
                </div>
            </body>
        </html>
    </xsl:template>
    
</xsl:stylesheet>