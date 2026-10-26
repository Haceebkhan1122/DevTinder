<!-- DevTinder Api's -->

authRouter
-POST /signup (DONE)
-POST /login  (DONE)
-POST /logout (DONE)


profileRouter
-GET /profile/view (DONE)
-PATCH /profile/edit (DONE) 
-PATCH /profile/password (DONE)


connectionRequestRouter
-POST /request/send/:status/:userId (DONE)
-POST /request/review/:accepted/:requestId (DONE)

userRouter
-GET /user/connections
-GET /user/requests/received
-GET /user/feed - Gets you the profile of other users on platform



Status: ignore, interested (For Sent Request Connection API)
Status: accepted, rejected (For Review Connection Request API)

