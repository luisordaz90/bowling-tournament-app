# Role-Based Access Control (RBAC) Implementation Plan

## Frontend Route Access Matrix

| Route | Super Admin | Tournament Director | League Manager | Team Captain | Scorekeeper | Player | Viewer |
|-------|------------|-------------------|---------------|-------------|------------|--------|--------|
| **Administrative Routes** |
| `/admin/users` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/admin/system-settings` | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Tournament Management** |
| `/tournaments` (list) | ✅ | ✅ | ✅ (assigned only) | ✅ (participating) | ✅ (assigned) | ✅ (participating) | ✅ |
| `/tournaments/new` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `/tournaments/[id]` | ✅ | ✅ | ✅ (if assigned) | ✅ (if participating) | ✅ (if assigned) | ✅ (if participating) | ✅ |
| `/tournaments/[id]/edit` | ✅ | ✅ (if owner) | ✅ (if assigned) | ❌ | ❌ | ❌ | ❌ |
| **Session Management** |
| `/tournaments/[id]/sessions` | ✅ | ✅ | ✅ (if assigned) | ❌ | ✅ (if assigned) | ❌ | ❌ |
| `/tournaments/[id]/sessions/[sessionNumber]/matches` | ✅ | ✅ | ✅ (if assigned) | 📝 (view only) | ✅ | 📝 (view only) | 📝 (view only) |
| **Schedule Management** |
| `/tournaments/[id]/schedule/summary` | ✅ | ✅ | ✅ (if assigned) | 📝 (view only) | 📝 (view only) | 📝 (view only) | 📝 (view only) |
| `/tournaments/[id]/schedule/validate` | ✅ | ✅ | ✅ (if assigned) | ❌ | ❌ | ❌ | ❌ |
| `/tournaments/[id]/schedule/preview` | ✅ | ✅ | ✅ (if assigned) | ❌ | ❌ | ❌ | ❌ |
| **Match Management** |
| `/matches` | ✅ | ✅ | ✅ (assigned tournaments) | 📝 (team matches) | ✅ (assigned matches) | 📝 (team matches) | 📝 (view only) |
| `/matches/[id]` | ✅ | ✅ | ✅ (if tournament assigned) | 📝 (if team involved) | ✅ (if assigned) | 📝 (if team involved) | 📝 (view only) |
| **Team Management** |
| `/teams` | ✅ | ✅ | ✅ (tournament teams) | ✅ (own team) | 📝 (view only) | 📝 (view only) | 📝 (view only) |
| `/teams/[id]` | ✅ | ✅ | ✅ (if tournament team) | ✅ (if own team) | 📝 (view only) | 📝 (if team member) | 📝 (view only) |
| **Player Management** |
| `/players` | ✅ | ✅ | ✅ (tournament players) | ✅ (team players) | 📝 (view only) | ✅ (own profile) | 📝 (view only) |
| `/players/[id]` | ✅ | ✅ | ✅ (if tournament player) | ✅ (if team player) | 📝 (view only) | ✅ (if own profile) | 📝 (view only) |
| **Statistics** |
| `/statistics` | ✅ | ✅ | ✅ (assigned tournaments) | 📝 (team stats) | 📝 (view only) | 📝 (own stats) | 📝 (view only) |
| `/tournaments/[id]/detailed-statistics` | ✅ | ✅ | ✅ (if assigned) | 📝 (team performance) | 📝 (view only) | 📝 (own performance) | 📝 (view only) |
| `/player-statistics` | ✅ | ✅ | ✅ (tournament players) | 📝 (team players) | 📝 (view only) | ✅ (own stats) | 📝 (view only) |
| `/team-statistics` | ✅ | ✅ | ✅ (tournament teams) | ✅ (own team) | 📝 (view only) | 📝 (team stats) | 📝 (view only) |

Legend:
- ✅ Full Access (Read/Write)
- 📝 Read-Only Access
- ❌ No Access

## Component-Level Access Control

### Navigation Menu Access
```typescript
interface MenuAccess {
  [UserRole.SUPER_ADMIN]: ['admin', 'tournaments', 'teams', 'players', 'matches', 'statistics'];
  [UserRole.TOURNAMENT_DIRECTOR]: ['tournaments', 'teams', 'players', 'matches', 'statistics'];
  [UserRole.LEAGUE_MANAGER]: ['tournaments', 'teams', 'players', 'matches', 'statistics']; // filtered
  [UserRole.TEAM_CAPTAIN]: ['tournaments', 'teams', 'players', 'matches', 'statistics']; // limited
  [UserRole.SCOREKEEPER]: ['tournaments', 'matches']; // scoring focused
  [UserRole.PLAYER]: ['tournaments', 'matches', 'statistics']; // personal focus
  [UserRole.VIEWER]: ['tournaments', 'matches', 'statistics']; // read-only
}
```

### Action Button Access
```typescript
interface ActionAccess {
  // Tournament Actions
  createTournament: [SUPER_ADMIN, TOURNAMENT_DIRECTOR];
  editTournament: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER]; // with ownership check
  deleteTournament: [SUPER_ADMIN, TOURNAMENT_DIRECTOR]; // with ownership check
  
  // Session Actions
  createSession: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  editSession: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  deleteSession: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  
  // Match Actions
  updateMatchStatus: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, SCOREKEEPER];
  enterScores: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, SCOREKEEPER, TEAM_CAPTAIN]; // with team check
  
  // Team Actions
  createTeam: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, TEAM_CAPTAIN];
  editTeam: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, TEAM_CAPTAIN]; // with ownership
  registerTeam: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, TEAM_CAPTAIN];
  
  // Player Actions
  addPlayer: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, TEAM_CAPTAIN]; // with team check
  editPlayer: [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, TEAM_CAPTAIN, PLAYER]; // with ownership
}
```

## Backend API Access Control

### Endpoint Access Matrix
```typescript
interface APIEndpointAccess {
  // Tournament Management
  'POST /tournaments': [SUPER_ADMIN, TOURNAMENT_DIRECTOR];
  'PUT /tournaments/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER]; // with ownership
  'DELETE /tournaments/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR]; // with ownership
  'GET /tournaments': 'ALL_AUTHENTICATED'; // filtered by access
  'GET /tournaments/:id': 'ALL_AUTHENTICATED'; // filtered by access
  
  // Session Management
  'POST /tournaments/:id/sessions': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  'PUT /sessions/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  'DELETE /sessions/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
  
  // Match Management
  'PUT /matches/:id/status': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, SCOREKEEPER];
  'POST /matches/:id/scores': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, SCOREKEEPER, TEAM_CAPTAIN];
  
  // Team Management
  'POST /teams': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, TEAM_CAPTAIN];
  'PUT /teams/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER, TEAM_CAPTAIN]; // with ownership
  'DELETE /teams/:id': [SUPER_ADMIN, TOURNAMENT_DIRECTOR]; // with ownership
  
  // Statistics
  'GET /tournaments/:id/statistics': 'ALL_AUTHENTICATED'; // filtered by role
  'GET /player-statistics': 'ALL_AUTHENTICATED'; // filtered by ownership
  'PUT /player-statistics': [SUPER_ADMIN, TOURNAMENT_DIRECTOR, LEAGUE_MANAGER];
}
```

### Data Filtering Rules
```typescript
interface DataFiltering {
  [UserRole.SUPER_ADMIN]: {
    tournaments: 'ALL',
    teams: 'ALL',
    players: 'ALL',
    matches: 'ALL',
    statistics: 'ALL'
  };
  
  [UserRole.TOURNAMENT_DIRECTOR]: {
    tournaments: 'OWNED_ONLY',
    teams: 'TOURNAMENT_TEAMS_ONLY',
    players: 'TOURNAMENT_PLAYERS_ONLY',
    matches: 'TOURNAMENT_MATCHES_ONLY',
    statistics: 'TOURNAMENT_STATISTICS_ONLY'
  };
  
  [UserRole.LEAGUE_MANAGER]: {
    tournaments: 'ASSIGNED_ONLY',
    teams: 'ASSIGNED_TOURNAMENT_TEAMS',
    players: 'ASSIGNED_TOURNAMENT_PLAYERS',
    matches: 'ASSIGNED_TOURNAMENT_MATCHES',
    statistics: 'ASSIGNED_TOURNAMENT_STATISTICS'
  };
  
  [UserRole.TEAM_CAPTAIN]: {
    tournaments: 'PARTICIPATING_ONLY',
    teams: 'OWN_TEAM_ONLY',
    players: 'TEAM_PLAYERS_ONLY',
    matches: 'TEAM_MATCHES_ONLY',
    statistics: 'TEAM_STATISTICS_ONLY'
  };
  
  [UserRole.PLAYER]: {
    tournaments: 'PARTICIPATING_ONLY',
    teams: 'OWN_TEAM_ONLY',
    players: 'SELF_ONLY',
    matches: 'TEAM_MATCHES_ONLY',
    statistics: 'SELF_STATISTICS_ONLY'
  };
  
  [UserRole.VIEWER]: {
    tournaments: 'PUBLIC_ONLY',
    teams: 'PUBLIC_TEAMS_ONLY',
    players: 'PUBLIC_PLAYERS_ONLY',
    matches: 'PUBLIC_MATCHES_ONLY',
    statistics: 'PUBLIC_STATISTICS_ONLY'
  };
}
```

## Implementation Strategy

### Phase 1: Foundation (Week 1-2)
1. **Auth0 Role Configuration**
   - Set up custom roles in Auth0
   - Configure role assignment workflows
   - Add role claims to JWT tokens

2. **Backend Permission Middleware**
   - Create role-based middleware for API endpoints
   - Implement resource ownership checks
   - Add permission validation utilities

3. **Frontend Role Context**
   - Create React context for user roles
   - Implement role-based component rendering
   - Add permission hooks for UI components

### Phase 2: Route Protection (Week 3)
1. **Enhanced Route Guards**
   - Upgrade ProtectedRoute component with role checks
   - Implement redirect logic for unauthorized access
   - Add permission-based route filtering

2. **Navigation Control**
   - Filter navigation menus by user roles
   - Hide/show action buttons based on permissions
   - Implement role-based page layouts

### Phase 3: Data Filtering (Week 4)
1. **Backend Data Filtering**
   - Implement role-based query filtering
   - Add ownership validation to data access
   - Create permission-aware API responses

2. **Frontend Data Handling**
   - Filter displayed data based on user roles
   - Implement permission-aware components
   - Add role-based error handling

### Phase 4: Advanced Features (Week 5-6)
1. **Granular Permissions**
   - Implement field-level permissions
   - Add time-based access controls
   - Create audit logging for sensitive operations

2. **User Management Interface**
   - Build role assignment interface for admins
   - Implement user invitation workflows
   - Add permission management tools

## Technical Implementation Details

### Frontend Components Needed
```typescript
// Enhanced ProtectedRoute with role checking
<ProtectedRoute requiredRole="tournament_director" resource="tournament:123">
  <TournamentEditPage />
</ProtectedRoute>

// Permission-aware components
<PermissionGate roles={['super_admin', 'tournament_director']}>
  <CreateTournamentButton />
</PermissionGate>

// Role-based navigation
<RoleBasedNavigation userRole={userRole} />

// Resource ownership checks
<ResourceGuard resource="team:456" permission="edit">
  <EditTeamForm />
</ResourceGuard>
```

### Backend Middleware Structure
```typescript
// Role-based endpoint protection
app.use('/api/tournaments', requireRole(['super_admin', 'tournament_director']));

// Resource ownership validation
app.put('/api/tournaments/:id', requireOwnership('tournament'), updateTournament);

// Permission-based data filtering
app.get('/api/tournaments', applyRoleFilters, getTournaments);
```

### Database Schema Additions

**Important Note**: Since we're using Auth0 for role management with JWT claims, we only need to store **resource associations** and **business logic relationships**, not basic role assignments.

```sql
-- Tournament resource ownership/assignment (for League Managers)
-- Auth0 provides the 'league_manager' role, we store WHICH tournaments they manage
CREATE TABLE tournament_assignments (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- Auth0 user ID from JWT
  tournament_id UUID NOT NULL,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by VARCHAR(255), -- Who assigned them
  
  UNIQUE(user_id, tournament_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Team resource ownership/membership
-- Auth0 provides 'team_captain' or 'player' role, we store WHICH team they belong to
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- Auth0 user ID from JWT
  team_id UUID NOT NULL,
  membership_type VARCHAR(50) NOT NULL, -- 'captain', 'player', 'manager'
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, team_id),
  FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Tournament resource ownership (for Tournament Directors)
-- We track who created/owns tournaments for ownership validation
CREATE TABLE tournament_ownership (
  id UUID PRIMARY KEY,
  tournament_id UUID NOT NULL,
  owner_user_id VARCHAR(255) NOT NULL, -- Auth0 user ID
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(tournament_id),
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
);

-- Optional: Cache user profile data from Auth0 for performance
-- This avoids repeated Auth0 API calls but is not required for permissions
CREATE TABLE user_profiles (
  user_id VARCHAR(255) PRIMARY KEY, -- Auth0 user ID
  email VARCHAR(255),
  name VARCHAR(255),
  roles JSONB, -- Cache of Auth0 roles for performance (optional)
  last_synced TIMESTAMP DEFAULT NOW()
);
```

## Auth0 vs Database Responsibility Split

### **Auth0 Manages (via JWT Claims)**
```typescript
// JWT token contains these claims
{
  "sub": "auth0|user123",
  "email": "user@example.com", 
  "roles": ["tournament_director", "team_captain"],
  "permissions": ["create:tournament", "edit:team"],
  // Custom claims we add in Auth0 Rules/Actions
  "app_metadata": {
    "user_type": "tournament_director"
  }
}
```

### **Our Database Manages (Resource Associations)**
```typescript
// We only store which resources users have access to
interface ResourceAssociations {
  tournaments_owned: string[];      // Tournament IDs user created
  tournaments_managing: string[];   // Tournament IDs user is assigned to manage  
  teams_member_of: string[];       // Team IDs user belongs to
  teams_captain_of: string[];      // Team IDs user captains
}
```

## Updated Permission Validation Flow

```typescript
// Backend middleware example
async function validateTournamentAccess(req, res, next) {
  const { roles } = req.user; // From Auth0 JWT
  const { tournamentId } = req.params;
  
  // Global roles get access
  if (roles.includes('super_admin')) {
    return next();
  }
  
  // Tournament directors get access to tournaments they own
  if (roles.includes('tournament_director')) {
    const ownership = await db.tournament_ownership
      .findOne({ tournament_id: tournamentId, owner_user_id: req.user.sub });
    if (ownership) return next();
  }
  
  // League managers get access to assigned tournaments
  if (roles.includes('league_manager')) {
    const assignment = await db.tournament_assignments
      .findOne({ tournament_id: tournamentId, user_id: req.user.sub });
    if (assignment) return next();
  }
  
  // Team captains get access to tournaments their team is in
  if (roles.includes('team_captain')) {
    const teamMembership = await db.team_memberships
      .findOne({ user_id: req.user.sub, membership_type: 'captain' });
    if (teamMembership) {
      const teamInTournament = await db.tournament_teams
        .findOne({ tournament_id: tournamentId, team_id: teamMembership.team_id });
      if (teamInTournament) return next();
    }
  }
  
  return res.status(403).json({ error: 'Insufficient permissions' });
}
```

## Benefits of This Approach

### **Auth0 Handles Identity & Global Roles**
- ✅ Single source of truth for user authentication
- ✅ Centralized role management across applications
- ✅ JWT contains all necessary role information
- ✅ No database queries needed for basic role checks

### **Database Handles Resource Associations**
- ✅ Dynamic resource assignments (tournaments, teams)
- ✅ Business logic relationships (team membership, tournament ownership)  
- ✅ Audit trail for resource access changes
- ✅ Performance optimization (no Auth0 API calls for resource checks)

### **No Role Duplication**
- ✅ Roles live in Auth0, resources live in database
- ✅ Clear separation of concerns
- ✅ Easier to maintain and audit
- ✅ Scales better as the application grows

This comprehensive plan provides a secure, scalable approach to implementing role-based access control across both frontend and backend systems while maintaining a good user experience for each role type.