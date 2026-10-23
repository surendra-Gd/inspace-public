# InSpace - Production-Grade Social Platform Architecture (verison2dev)

A real-time private social-space platform built with React Native + Expo frontend and Spring Boot backend. This is a complete, production-ready architecture demonstration.

**Repository:** [surendra-Gd/inspace](https://github.com/surendra-Gd/inspace)  
**Branch:** `verison2dev`  
**Live Demo:** https://api.theinspace.net

---

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         INSPACE ARCHITECTURE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      REACT NATIVE FRONTEND                             │ │
│  │                    (test3 - Expo Framework)                            │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  ┌─ PRESENTATION LAYER ─────────────────────────────────────────────┐ │ │
│  │  │  Screens:                                                         │ │ │
│  │  │  ├─ (auth) → login, signup, forgot-password                      │ │ │
│  │  │  └─ (main)                                                        │ │ │
│  │  │      ├─ Home Feed (posts)                                        │ │ │
│  │  │      ├─ Spaces (list, create, join)                            │ │ │
│  │  │      ├─ Space                                                   │ │ │
│  │  │      │   ├─ Home (timeline)                                    │ │ │
│  │  │      │   ├─ Text (discussion thread)                           │ │ │
│  │  │      │   └─ YourPage (profile in space)                       │ │ │
│  │  │      ├─ Profile                                                │ │ │
│  │  │      ├─ Friends                                                │ │ │
│  │  │      └─ Settings                                               │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ STATE MANAGEMENT LAYER ────────────────────────────────────────┐ │ │
│  │  │  Redux Store Structure:                                          │ │ │
│  │  │                                                                   │ │ │
│  │  │  store = {                                                       │ │ │
│  │  │    auth: {                    ← Authentication                   │ │ │
│  │  │      userData,                  User info, tokens, login state   │ │ │
│  │  │      accessToken,               JWT (6 hours)                    │ │ │
│  │  │      refreshToken               Refresh token (30 days)          │ │ │
│  │  │    },                                                             │ │ │
│  │  │                                                                   │ │ │
│  │  │    user: {                     ← User Domain                     │ │ │
│  │  │      friends,                   List of friends                  │ │ │
│  │  │      friendRequests,            Incoming/outgoing requests       │ │ │
│  │  │      suggestedUsers              Recommendations                 │ │ │
│  │  │    },                                                             │ │ │
│  │  │                                                                   │ │ │
│  │  │    space: {                    ← Space Domain                    │ │ │
│  │  │      spaces: {                  Spaces by ID                     │ │ │
│  │  │        [spaceId]: {              Space object                    │ │ │
│  │  │          info,                    Basic info                     │ │ │
│  │  │          members,                 Members in space               │ │ │
│  │  │          posts,                   Feed posts                     │ │ │
│  │  │          texts,                   Discussion threads             │ │ │
│  │  │          currentMember,           Current user's role in space   │ │ │
│  │  │          spaceToken               Space-specific token (30 min)  │ │ │
│  │  │        }                                                          │ │ │
│  │  │      },                                                           │ │ │
│  │  │      currentSpaceId               Active space ID                │ │ │
│  │  │    },                                                             │ │ │
│  │  │                                                                   │ │ │
│  │  │    stomp: {                    ← REAL-TIME BACKBONE ⭐          │ │ │
│  │  │      stompClient,                Active WebSocket connection    │ │ │
│  │  │      subscribedChannels,         ["sub/user/7", "sub/space/3"]  │ │ │
│  │  │      isConnected                 Connection status              │ │ │
│  │  │    },                                                             │ │ │
│  │  │                                                                   │ │ │
│  │  │    text: {},                   ← Text Domain                     │ │ │
│  │  │    post: {},                   ← Post Domain                     │ │ │
│  │  │    app: {}                     ← App Global State                │ │ │
│  │  │  }                                                                │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ MIDDLEWARE PIPELINE (MOST IMPORTANT!) ──────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  Action Flow:                                                     │ │ │
│  │  │  dispatch(action) → tokenMiddleware → websocketMiddleware         │ │ │
│  │  │                   → notificationMiddleware → backendMiddleware    │ │ │
│  │  │                   → Reducers → State Update                       │ │ │
│  │  │                                                                    │ │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  │ 1. TOKEN MIDDLEWARE (Authentication)                        │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────┤ │ │
│  │  │  │ • Watches: All API requests                                 │ │ │
│  │  │  │ • Does: Injects JWT token to headers                       │ │ │
│  │  │  │ • Also: Handles token refresh on 401                       │ │ │
│  │  │  │ • Polyfill: Adds TextDecoder/TextEncoder for STOMP        │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │  │                                                                    │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  │ 2. WEBSOCKET MIDDLEWARE (Real-time) ⭐⭐⭐                 │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────┤ │ │
│  │  │  │ CONNECT_STOMP:                                               │ │ │
│  │  │  │   └─ Create STOMP client & connect to                       │ │ │
│  │  │  │      wss://api.theinspace.net/ws/websocket?token=JWT        │ │ │
│  │  │  │      with: JWT auth, heartbeat (4s), auto-reconnect (5s)    │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ SUBSCRIBE_CHANNEL:                                           │ │ │
│  │  │  │   └─ stompClient.subscribe("/sub/space/123", callback)      │ │ │
│  │  │  │      → Receives: WS_ADD_TEXT, WS_ADD_POST, etc.             │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ SEND_MESSAGE:                                                │ │ │
│  │  │  │   └─ stompClient.publish({                                   │ │ │
│  │  │  │        destination: "/app/text/123",                         │ │ │
│  │  │  │        body: JSON.stringify(message)                        │ │ │
│  │  │  │      })                                                      │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ DISCONNECT_STOMP:                                            │ │ │
│  │  │  │   └─ Unsubscribe all channels & deactivate client           │ │ │
│  │  │  │      (Triggered on logout or app termination)               │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │  │                                                                    │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  │ 3. NOTIFICATION MIDDLEWARE (Push Alerts)                   │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────┤ │ │
│  │  │  │ REGISTER_NOTIFICATION:                                       │ │ │
│  │  │  │   ├─ Check device (not simulator)                           │ │ │
│  │  │  │   ├─ Request permissions (one-time)                         │ │ │
│  │  │  │   ├─ Get FCM token: Notifications.getDevicePushTokenAsync() │ │ │
│  │  │  │   ├─ POST /notification/save-token with token               │ │ │
│  │  │  │   └─ Store in AsyncStorage to prevent re-registration       │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ Handled Events:                                              │ │ │
│  │  │  │   • WS_ADD_TEXT → Streak notification                       │ │ │
│  │  │  │   • WS_ADD_POST_COMMENT → Comment notification              │ │ │
│  │  │  │   • WS_NEW_FRIEND_REQUEST → Friend notification             │ │ │
│  │  │  │   • WS_SPACE_REQUEST → Space join request                   │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │  │                                                                    │ │
│  │  │  ┌─────────────────────────────────────────────────────────────┐ │ │
│  │  │  │ 4. BACKEND MIDDLEWARE (API Sync)                           │ │ │
│  │  │  ├─────────────────────────────────────────────────────────────┤ │ │
│  │  │  │ UPDATE_FRIEND_REQUESTS_SEEN:                                 │ │ │
│  │  │  │   └─ When user views friend requests                        │ │ │
│  │  │  │      → PUT /friend-requests/seen (mark as read)             │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ ADD_SPACE (if admin):                                        │ │ │
│  │  │  │   └─ When admin joins space                                 │ │ │
│  │  │  │      → GET /space/count (fetch unseen requests count)       │ │ │
│  │  │  │      → SET_UNSEEN_SPACE_REQUESTS                            │ │ │
│  │  │  │                                                              │ │ │
│  │  │  │ UPDATE_UNSEEN_SPACE_REQUESTS:                                │ │ │
│  │  │  │   └─ When admin reviews requests                            │ │ │
│  │  │  │      → PUT /space/mark-seen (mark as reviewed)              │ │ │
│  │  │  └─────────────────────────────────────────────────────────────┘ │ │
│  │  └─────────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ API LAYER ──────────────────────────────────────────────────────┐ │ │
│  │  │  Axios Instances with Auto-Headers:                              │ │ │
│  │  │                                                                   │ │ │
│  │  │  API = axios.create(baseURL: https://api.theinspace.net/api/v1) │ │ │
│  │  │    └─ Request Interceptor adds:                                 │ │ │
│  │  │       ├─ Authorization: Bearer <accessToken>                   │ │ │
│  │  │       └─ (Token loaded from AsyncStorage)                      │ │ │
│  │  │                                                                   │ │ │
│  │  │  SPACE_API = axios.create(baseURL: ...api/v1/in-space)          │ │ │
│  │  │    └─ Request Interceptor adds:                                 │ │ │
│  │  │       ├─ Authorization: Bearer <accessToken>                   │ │ │
│  │  │       ├─ X-Space-Token: <spaceToken>     (30 min)              │ │ │
│  │  │       ├─ X-Member-Id: <memberId>        (role in space)       │ │ │
│  │  │       └─ X-Space-Id: <spaceId>          (current space)       │ │ │
│  │  │                                                                   │ │ │
│  │  │    └─ Response Interceptor:                                      │ │ │
│  │  │       └─ If new X-Space-Token in response                       │ │ │
│  │  │          → Save to AsyncStorage (refresh token)                 │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                      SPRING BOOT BACKEND                               │ │
│  │                  (backend-demo - Java Microservice)                    │ │
│  ├────────────────────────────────────────────────────────────────────────┤ │
│  │                                                                         │ │
│  │  ┌─ SECURITY LAYER ──────────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  SecurityConfiguration:                                           │ │ │
│  │  │  ├─ CSRF: Disabled (for REST API)                               │ │ │
│  │  │  ├─ CORS: Enabled with allowed origins                          │ │ │
│  │  │  ├─ Session: STATELESS (each request is independent)            │ │ │
│  │  │  └─ Filters:                                                     │ │ │
│  │  │     ├─ JwtAuthenticationFilter                                   │ │ │
│  │  │     │  └─ Validates JWT token from header                       │ │ │
│  │  │     │     → Sets Authentication in SecurityContext              │ │ │
│  │  │     │                                                             │ │ │
│  │  │     └─ SpaceAuthenticationFilter                                 │ │ │
│  │  │        └─ Validates Space Token (X-Space-Token header)          │ │ │
│  │  │           → Ensures memberId is valid for space                 │ │ │
│  │  │           → Sets spaceInfo in session                           │ │ │
│  │  │                                                                   │ │ │
│  │  │  JwtService:                                                      │ │ │
│  │  │  ├─ generateAuthToken()    → 6 hours (main JWT)                │ │ │
│  │  │  ├─ generateRefreshToken() → 30 days (renewal)                 │ │ │
│  │  │  └─ generateSpaceToken()   → 30 mins (space-specific)          │ │ │
│  │  │     └─ Contains: memberId, spaceId, role                        │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ WEBSOCKET LAYER ────────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  WebSocketConfig:                                                 │ │ │
│  │  │  ├─ Endpoint: /ws                                                │ │ │
│  │  │  ├─ Broker: Simple broker at /sub/                              │ │ │
│  │  │  ├─ Destination prefix: /app                                     │ │ │
│  │  │  └─ Interceptors:                                                │ │ │
│  │  │     ├─ HttpSessionHandshakeInterceptor                           │ │ │
│  │  │     └─ AuthHandshakeInterceptors                                 │ │ │
│  │  │        └─ Validates JWT in handshake                            │ │ │
│  │  │           → Extracts user & spaceInfo                           │ │ │
│  │  │           → Stores in session attributes                        │ │ │
│  │  │                                                                   │ │ │
│  │  │  WebSocketController:                                             │ │ │
│  │  │  ├─ @MessageMapping("/ws.addText")                              │ │ │
│  │  │  │  └─ Receives CreateText payload                              │ │ │
│  │  │  │     → textService.addText()                                  │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ @MessageMapping("/tm.addTextMessage")                       │ │ │
│  │  │  │  └─ Receives CreateTextMessage payload                       │ │ │
│  │  │  │     → textMessageService.addTextMessage()                    │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ @MessageMapping("/post.addComment")                         │ │ │
│  │  │  │  └─ Receives PostCommentRequest payload                      │ │ │
│  │  │  │     → postCommentService.addCommentOrReply()                 │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ @MessageMapping("/text.like")                               │ │ │
│  │  │  ├─ @MessageMapping("/text.removeText")                         │ │ │
│  │  │  ├─ @MessageMapping("/post.deleteComment")                      │ │ │
│  │  │  └─ @MessageMapping("/comment.deleteReply")                     │ │ │
│  │  │                                                                   │ │ │
│  │  │  Each handler:                                                    │ │ │
│  │  │  ├─ webSocketService.validateSpaceAuth()                         │ │ │
│  │  │  │  └─ Checks: Is memberId authorized for this space?           │ │ │
│  │  │  │     → Throws AccessDeniedException if not                    │ │ │
│  │  │  │                                                               │ │ │
│  │  │  └─ Call business service → Publish to Redis → Broadcast        │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ BUSINESS LOGIC LAYER ───────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  Domain Services (Pattern: *Service & *ServiceImpl):              │ │ │
│  │  │                                                                   │ │ │
│  │  │  TextService:                                                      │ │ │
│  │  │  ├─ addText(CreateText, spaceId)                                 │ │ │
│  │  │  │  ├─ Save to PostgreSQL                                       │ │ │
│  │  │  │  ├─ Calculate streak (user engagement metric)                │ │ │
│  │  │  │  ├─ Publish to Redis: /sub/space/{spaceId}                  │ │ │
│  │  │  │  │  with action: WS_ADD_TEXT                                 │ │ │
│  │  │  │  └─ Notify: notificationService.notificationOnNewText()     │ │ │
│  │  │  │     → Firebase push to all space members                     │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ getTexts(spaceId, page)   → Paginated list (REST)          │ │ │
│  │  │  ├─ deleteText(textId)        → Soft delete + publish           │ │ │
│  │  │  ├─ likeToText(textId)        → Increment likes + publish       │ │ │
│  │  │  └─ unlikeToText(textId)      → Decrement likes + publish       │ │ │
│  │  │                                                                   │ │ │
│  │  │  PostService:                                                     │ │ │
│  │  │  ├─ addPost()    → Save + notify                                │ │ │
│  │  │  ├─ getPost()    → Fetch with comments                          │ │ │
│  │  │  └─ deletePost() → Remove + publish                             │ │ │
│  │  │                                                                   │ │ │
│  │  │  NotificationService:                                             │ │ │
│  │  │  ├─ storeNotificationToken(deviceToken)                          │ │ │
│  │  │  │  └─ Save/update FCM token in database                        │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ notificationOnNewPost(spaceId, postId, streak)             │ │ │
│  │  │  │  ├─ Get all member device tokens for space                   │ │ │
│  │  │  │  └─ Send via FirebaseMessaging.send()                        │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ notificationOnNewText()                                      │ │ │
│  │  │  ├─ notificationOnNewMemberJoin()                                │ │ │
│  │  │  ├─ notificationOnFriendRequests()                               │ │ │
│  │  │  └─ notificationOnSpaceRequest()                                 │ │ │
│  │  │                                                                   │ │ │
│  │  │  WebSocketService:                                                │ │ │
│  │  │  ├─ validateSpaceAuth(memberId)                                  │ │ │
│  │  │  │  └─ Verify session: Is memberId in authorized spaces?        │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ getUserFromSession()                                         │ │ │
│  │  │  │  └─ Extract User object from WebSocket session              │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ subscribeToRedisChannels(userId, spaceInfo)                │ │ │
│  │  │  │  └─ Subscribe to /sub/space/{spaceId} for each space        │ │ │
│  │  │  │     (Auto-done on connection)                               │ │ │
│  │  │  │                                                               │ │ │
│  │  │  └─ publishOfflineStatusToMembers(user, status)                 │ │ │
│  │  │     └─ Broadcast user went OFFLINE to all their spaces          │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ CACHING & REAL-TIME LAYER ──────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  Redis (In-Memory Data Store):                                    │ │ │
│  │  │                                                                   │ │ │
│  │  │  RedisConfiguration:                                              │ │ │
│  │  │  ├─ RedisTemplate<String, Object>                               │ │ │
│  │  │  │  └─ JSON Serialization (handles LocalDateTime)               │ │ │
│  │  │  │                                                               │ │ │
│  │  │  └─ RedisMessageListenerContainer                               │ │ │
│  │  │     └─ Listens for Pub/Sub messages                             │ │ │
│  │  │                                                                   │ │ │
│  │  │  RedisService:                                                    │ │ │
│  │  │  ├─ publishMessage(channel, message)                            │ │ │
│  │  │  │  └─ Publish to /sub/space/{spaceId}                          │ │ │
│  │  │  │     → All subscribers receive instantly                      │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ subscribeToChannel(userId, channel)                         │ │ │
│  │  │  │  └─ Track which users are subscribed                         │ │ │
│  │  │  │                                                               │ │ │
│  │  │  └─ unsubscribeFromChannel(userId, channel)                     │ │ │
│  │  │     └─ Cleanup when user disconnects                            │ │ │
│  │  │                                                                   │ │ │
│  │  │  RedisSubscriber:                                                 │ │ │
│  │  │  └─ onMessage(Message)                                           │ │ │
│  │  │     └─ Receives published messages from Redis                    │ │ │
│  │  │                                                                   │ │ │
│  │  │  OnlineUserService:                                               │ │ │
│  │  │  ├─ markUserOnline(userId)                                       │ │ │
│  │  │  ├─ markUserOffline(userId)                                      │ │ │
│  │  │  └─ isUserOnline(userId) → Boolean                              │ │ │
│  │  │     (Used for "online status" indicator)                         │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ PERSISTENCE LAYER ──────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  PostgreSQL Database:                                             │ │ │
│  │  │  ├─ Entities: User, Space, Member, Text, Post, Comment, etc.    │ │ │
│  │  │  ├─ Repositories: Spring Data JPA (auto CRUD)                    │ │ │
│  │  │  ├─ Migrations: Flyway (V1__init_db.sql, V2__dynamic_changes)   │ │ │
│  │  │  └─ Relationships:                                               │ │ │
│  │  │     ├─ User 1→∞ Space (joined spaces)                           │ │ │
│  │  │     ├─ User 1→∞ Post (posts in feed)                            │ │ │
│  │  │     ├─ Space 1→∞ Member (members in space)                      │ │ │
│  │  │     ├─ Space 1→∞ Text (discussion threads)                      │ │ │
│  │  │     ├─ Text 1→∞ TextMessage (replies)                           │ │ │
│  │  │     └─ Post 1→∞ PostComment (comments)                          │ │ │
│  │  │                                                                   │ │ │
│  │  │  S3 Cloud Storage (AWS):                                          │ │ │
│  │  │  ├─ Buckets:                                                      │ │ │
│  │  │  │  ├─ fs-inspace-raw          → User avatars                    │ │ │
│  │  │  │  └─ fs-inspace-raw-image    → Post images                    │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ S3Service methods:                                            │ │ │
│  │  │  │  ├─ putObject()          → Upload with cache headers         │ │ │
│  │  │  │  ├─ getPublicUrl()       → Get direct CDN URL                │ │ │
│  │  │  │  ├─ generatePreSignUrl() → 7-day temporary link              │ │ │
│  │  │  │  └─ deleteObject()       → Remove from S3                    │ │ │
│  │  │  │                                                               │ │ │
│  │  │  ├─ Cache Control: Served by CloudFront CDN                      │ │ │
│  │  │  └─ Presigned URLs: Temporary access without exposing S3 keys   │ │ │
│  │  │                                                                   │ │ │
│  │  │  Firebase Cloud Messaging:                                        │ │ │
│  │  │  ├─ FirebaseConfig:                                              │ │ │
│  │  │  │  └─ Initialized with service account JSON                    │ │ │
│  │  │  │                                                               │ │ │
│  │  │  └─ FirebaseMessaging.send(Message):                             │ │ │
│  │  │     ├─ Sends to FCM token                                       │ │ │
│  │  │     ├─ Includes title, body, image, data payload                │ │ │
│  │  │     └─ Handles token expiration (flag & retry)                  │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ REST API LAYER ──────────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  Dual API Design:                                                 │ │ │
│  │  │                                                                   │ │ │
│  │  │  1. PUBLIC API (No space context):                                │ │ │
│  │  │     Base: /api/v1/                                               │ │ │
│  │  │     ├─ POST /auth/register        → Create account               │ │ │
│  │  │     ├─ POST /auth/login           → Get JWT token                │ │ │
│  │  │     ├─ POST /auth/refresh         → Refresh expired JWT           │ │ │
│  │  │     ├─ GET  /user/profile         → Current user info            │ │ │
│  │  │     ├─ GET  /user/friends         → Friend list                  │ │ │
│  │  │     └─ GET  /spaces               → List user's spaces           │ │ │
│  │  │                                                                   │ │ │
│  │  │  2. SPACE-SCOPED API (Requires space token):                      │ │ │
│  │  │     Base: /api/v1/in-space/                                       │ │ │
│  │  │     Headers required:                                             │ │ │
│  │  │     ├─ Authorization: Bearer <JWT>                              │ │ │
│  │  │     ├─ X-Space-Token: <spaceToken>                              │ │ │
│  │  │     ├─ X-Member-Id: <memberId>                                  │ │ │
│  │  │     └─ X-Space-Id: <spaceId>                                    │ │ │
│  │  │                                                                   │ │ │
│  │  │     Endpoints:                                                    │ │ │
│  │  │     ├─ GET  /text                 → List texts with pagination   │ │ │
│  │  │     ├─ GET  /text/{textId}        → Text detail + reactions      │ │ │
│  │  │     ├─ GET  /text/{textId}/messages → Text replies              │ │ │
│  │  │     ├─ GET  /post                 → List posts                   │ │ │
│  │  │     ├─ GET  /members              → Space members                │ │ │
│  │  │     └─ POST /space/join-request   → Request to join              │ │ │
│  │  │                                                                   │ │ │
│  │  │  @SpaceSecured Annotation:                                        │ │ │
│  │  │  └─ Custom annotation validates space token                      │ │ │
│  │  │     ├─ Extracts headers                                          │ │ │
│  │  │     ├─ Validates space membership                                │ │ │
│  │  │     └─ Injects @RequestAttribute("memberId", "spaceId")         │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  │  ┌─ EXCEPTION HANDLING ──────────────────────────────────────────────┐ │ │
│  │  │                                                                    │ │ │
│  │  │  GlobalExceptionHandler:                                          │ │ │
│  │  │  ├─ AccessDeniedException      → 403 (Space not authorized)     │ │ │
│  │  │  ├─ ResourceNotFoundException  → 404 (Entity not found)         │ │ │
│  │  │  ├─ InvalidCredentialsException → 401 (Wrong password)          │ │ │
│  │  │  ├─ EntityFoundException       → 409 (Already exists)           │ │ │
│  │  │  ├─ ValidationException        → 422 (Invalid input)            │ │ │
│  │  │  └─ OperationFailedException   → 500 (Server error)             │ │ │
│  │  │                                                                   │ │ │
│  │  │  Each returns:                                                    │ │ │
│  │  │  {                                                                │ │ │
│  │  │    "success": false,                                              │ │ │
│  │  │    "code": "EXCEPTION_TYPE",                                      │ │ │
│  │  │    "message": "User-friendly error message"                       │ │ │
│  │  │  }                                                                │ │ │
│  │  │                                                                   │ │ │
│  │  └─────────────────────────────────────────────────────────────────┘ │ │
│  │                                                                         │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Highlights

### 🚀 Real-Time Communication
- **Technology**: STOMP + WebSocket over WSS
- **Why**: No polling overhead, full-duplex communication, protocol guarantee
- **Implementation**: `test3/middlewares/websocketMiddleware.js` + `backend-demo/.../WebSocketConfig.java`

### 🔐 Multi-Layer Security
- **JWT Token**: 6-hour global authentication for all APIs
- **Space Token**: 30-minute space-scoped access tokens
- **Validation**: Enforced at WebSocket handshake and every message

### 📢 Pub/Sub Event Broadcasting
- **Technology**: Redis Pub/Sub
- **Benefit**: Instant updates to all subscribers, horizontally scalable
- **Pattern**: User posts → Backend publishes to `/sub/space/{spaceId}` → All clients receive

### 🔔 Push Notifications
- **Technology**: Firebase Cloud Messaging (FCM)
- **Features**: 
  - Offline delivery (Firebase handles retries)
  - Rich notifications with images and payloads
  - Device token auto-expiration tracking

### 📱 Context-Aware UI
- **Smart Feedback**: Vibration if viewing content, toast if elsewhere
- **Unseen Badges**: Track unread items per space
- **Optimistic Updates**: UI updates immediately while data syncs

### 📦 Media Management
- **Technology**: AWS S3 + CloudFront CDN
- **Security**: Presigned URLs (7-day temporary access)
- **Performance**: Cache control headers for CDN optimization

---

## Why This Architecture is Strong

| Aspect | Solution | Benefit |
|--------|----------|---------|
| Real-time | STOMP + Redis Pub/Sub | 0 latency, no polling |
| Security | JWT + Space Token | Multi-layer, time-limited access |
| Scalability | Redis Pub/Sub, async notifications | Handles 1000s of concurrent users |
| Code Quality | Middleware separation | Easy to test, debug, and extend |
| UX | Context-aware feedback | App feels responsive and intentional |
| Media | S3 with presigned URLs | Secure, efficient, CDN-ready |

---

## Project Structure

```
inspace/
├── test3/                          # React Native Frontend (Expo)
│   ├── app/                        # Route-based screens
│   ├── service/
│   │   ├── store.js               # Redux store + middleware pipeline
│   │   ├── reducers/              # auth, user, space, stomp, text, post, app
│   │   ├── actions/               # Redux thunks + STOMP event handlers
│   │   └── api/                   # Axios instances + API calls
│   ├── middlewares/
│   │   ├── tokenMiddleware.js      # JWT injection & refresh
│   │   ├── websocketMiddleware.js  # STOMP connection & messages
│   │   ├── notificationMiddleware.js # Firebase token registration
│   │   └── backendMiddleware.js    # API sync for admin ops
│   └── components/                # Reusable UI components
│
└── backend-demo/                   # Spring Boot Backend
    ├── src/main/java/com/backend/demo/
    │   ├── websocket/             # STOMP config & controllers
    │   ├── security/              # JWT & authentication
    │   ├── service/               # Business logic (Text, Post, User, etc.)
    │   ├── redis/                 # Pub/Sub configuration
    │   ├── notification/          # Firebase integration
    │   ├── s3/                    # AWS S3 operations
    │   └── api/                   # REST endpoints
    └── src/main/resources/
        ├── application.yml         # Configuration
        └── db/migration/           # Flyway migrations
```

---

## Getting Started

### Frontend
```bash
cd test3
npm install
npx expo start
```

### Backend
```bash
cd backend-demo
mvn clean install
mvn spring-boot:run
```

---

## Main Entry Points

### Frontend
- **Store**: `test3/service/store.js`
- **WebSocket Middleware**: `test3/middlewares/websocketMiddleware.js`
- **STOMP Event Handlers**: `test3/service/actions/stompActions.js`
- **Notification Middleware**: `test3/middlewares/notificationMiddleware.js`

### Backend
- **WebSocket Config**: `backend-demo/src/main/java/com/backend/demo/websocket/WebSocketConfig.java`
- **WebSocket Controller**: `backend-demo/src/main/java/com/backend/demo/websocket/WebSocketController.java`
- **Security Config**: `backend-demo/src/main/java/com/backend/demo/security/SecurityConfiguration.java`
- **Notification Service**: `backend-demo/src/main/java/com/backend/demo/notification/NotificationService.java`
- **Redis Config**: `backend-demo/src/main/java/com/backend/demo/redis/RedisConfiguration.java`

---

## Tech Stack

### Frontend
- React Native + Expo
- Redux Toolkit
- STOMP (@stomp/stompjs)
- Axios
- Firebase Cloud Messaging
- React Navigation

### Backend
- Spring Boot 3.2.1
- Spring WebSocket + STOMP
- Spring Security + JWT (jjwt)
- Spring Data JPA
- PostgreSQL
- Redis
- AWS S3 SDK
- Firebase Admin SDK
- Flyway Migrations

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new user
- `POST /api/v1/auth/login` — Login and get JWT
- `POST /api/v1/auth/refresh` — Refresh JWT token

### User
- `GET /api/v1/user/profile` — Current user info
- `GET /api/v1/user/friends` — Friends list
- `GET /api/v1/spaces` — User's spaces

### Space-Scoped (Requires space token)
- `GET /api/v1/in-space/text` — List texts with pagination
- `GET /api/v1/in-space/text/{textId}` — Text detail
- `GET /api/v1/in-space/text/{textId}/messages` — Text replies
- `GET /api/v1/in-space/post` — List posts
- `GET /api/v1/in-space/members` — Space members

### WebSocket (STOMP)
- `/app/ws.addText` → Add text to space
- `/app/tm.addTextMessage` → Reply to text
- `/app/text.like` → Like a text
- `/app/text.removeText` → Delete text
- `/app/post.addComment` → Comment on post
- `/app/post.deleteComment` → Delete comment

---

## What I Liked Most About This Architecture

1. **Real-time backbone is solid** — STOMP + Redis Pub/Sub handles everything at millisecond latency
2. **Middleware pipeline separates concerns** — Each middleware has a single job, easy to test and extend
3. **Multi-space isolation** — Users can be in multiple spaces with complete data separation
4. **Security-first design** — JWT + space tokens + session validation at every layer
5. **Context-aware UX** — Smart feedback based on what user is currently viewing
6. **Production-ready** — Handles offline notifications, token expiration, media delivery, scaling

This is not just a demo—it's a real social platform architecture that could scale to millions of users.

---

## License

MIT

---

**Questions?** Check out the code and architecture flows above. This is a complete, end-to-end system design.
