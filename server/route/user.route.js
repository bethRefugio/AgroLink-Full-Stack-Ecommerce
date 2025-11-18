import { Router } from 'express'
import { forgotPasswordController, loginController, logoutController, refreshToken, registerUserController, resetpassword, updateUserDetails, uploadAvatar, userDetails, verifyEmailController, verifyForgotPasswordOtp, addPreferences, getPreferences, deletePreference , adminUpdateUserController, deleteUserController } from '../controllers/user.controller.js'
import auth from '../middleware/auth.js'
import upload from '../middleware/multer.js'
import User from '../models/user.model.js'


const userRouter = Router()


userRouter.post('/register',registerUserController)
userRouter.post('/verify-email',verifyEmailController)
userRouter.post('/login',loginController)
userRouter.get('/logout',auth,logoutController)
userRouter.put('/upload-avatar',auth,upload.single('avatar'),uploadAvatar)
userRouter.put('/update-user',auth,updateUserDetails)
userRouter.put('/forgot-password',forgotPasswordController)
userRouter.put('/verify-forgot-password-otp',verifyForgotPasswordOtp)
userRouter.put('/reset-password',resetpassword)
userRouter.post('/refresh-token',refreshToken)
userRouter.get('/user-details',auth,userDetails)
userRouter.post('/verify-email', verifyEmailController)
userRouter.put('/add-preference', auth, addPreferences)
userRouter.get('/preferences', auth, getPreferences);
userRouter.delete('/delete-preference', auth, deletePreference);
userRouter.put('/admin-update-user', auth, adminUpdateUserController);
userRouter.delete('/delete-user', auth, deleteUserController);
userRouter.get('/users-table', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    const users = await User.find().select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default userRouter

