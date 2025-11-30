import sendEmail from '../config/sendEmail.js'
import UserModel from '../models/user.model.js'
import bcryptjs from 'bcryptjs'
import verifyEmailTemplate from '../utils/verifyEmailTemplate.js'
import generatedAccessToken from '../utils/generatedAccessToken.js'
import genertedRefreshToken from '../utils/generatedRefreshToken.js'
import uploadImageClodinary from '../utils/uploadImageClodinary.js'
import generatedOtp from '../utils/generatedOtp.js'
import forgotPasswordTemplate from '../utils/forgotPasswordTemplate.js'
import jwt from 'jsonwebtoken'



export async function registerUserController(request,response){
    try {
        const { name, email , password, role } = request.body


        if(!name || !email || !password || !role){
            return response.status(400).json({
                message : "provide email, name, password, role",
                error : true,
                success : false
            })
        }


        const user = await UserModel.findOne({ email })


        if(user){
            return response.json({
                message : "Already register email",
                error : true,
                success : false
            })
        }


        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password,salt)


        const payload = {
            name,
            email,
            password : hashPassword,
            role
        }


        const newUser = new UserModel(payload)
        const save = await newUser.save()


        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`


        const verifyEmail = await sendEmail({
            sendTo : email,
            subject : "Verify email from AgroLink",
            html : verifyEmailTemplate({
                name,
                url : VerifyEmailUrl
            })
        })


        return response.json({
            message : "User register successfully",
            error : false,
            success : true,
            data : save
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


export async function verifyEmailController(request,response){
    try {
        const { code } = request.body;

        if (!code) {
            return response.status(400).json({
                message: "Verification code is required",
                error: true,
                success: false
            });
        }

        // Ensure the user exists
        const user = await UserModel.findById(code).select('_id email verify_email');
        if (!user) {
            return response.status(404).json({
                message: "Invalid verification code",
                error: true,
                success: false
            });
        }

        if (user.verify_email) {
            return response.json({
                message: "Email already verified",
                success: true,
                error: false
            });
        }

        // Update and return the new document
        const updated = await UserModel.findByIdAndUpdate(
            user._id,
            { $set: { verify_email: true } },
            { new: true }
        ).select('_id email verify_email');

        if (!updated || updated.verify_email !== true) {
            return response.status(500).json({
                message: "Failed to update verification status",
                error: true,
                success: false
            });
        }

        return response.json({
            message: "Verify email done",
            success: true,
            error: false,
            data: { _id: updated._id, email: updated.email, verify_email: updated.verify_email }
        });
    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}


export async function loginController(request,response){
    try {
        const { email , password } = request.body

        if(!email || !password){
            return response.status(400).json({
                message : "provide email, password",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "User not register",
                error : true,
                success : false
            })
        }

        // ✅ CHECK EMAIL VERIFICATION
        if(!user.verify_email){
            return response.status(403).json({
                message : "Please verify your email before logging in. Check your inbox for the verification link.",
                error : true,
                success : false,
                needsVerification: true
            })
        }

        if(user.status !== "Active"){
            return response.status(400).json({
                message : "Contact to Admin",
                error : true,
                success : false
            })
        }

        const checkPassword = await bcryptjs.compare(password,user.password)

        if(!checkPassword){
            return response.status(400).json({
                message : "Check your password",
                error : true,
                success : false
            })
        }

        const accesstoken = await generatedAccessToken(user._id)
        const refreshToken = await genertedRefreshToken(user._id)

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }
        response.cookie('accessToken',accesstoken,cookiesOption)
        response.cookie('refreshToken',refreshToken,cookiesOption)

        return response.json({
            message : "Login successfully",
            error : false,
            success : true,
            data : {
                accesstoken,
                refreshToken
            }
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
  }



//logout controller
export async function logoutController(request,response){
    try {
        const userid = request.userId //middleware


        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }


        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)


        const removeRefreshToken = await UserModel.findByIdAndUpdate(userid,{
            refresh_token : ""
        })


        return response.json({
            message : "Logout successfully",
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//upload user avatar
export async  function uploadAvatar(request,response){
    try {
        const userId = request.userId // auth middlware
        const image = request.file  // multer middleware


        const upload = await uploadImageClodinary(image)
       
        const updateUser = await UserModel.findByIdAndUpdate(userId,{
            avatar : upload.url
        })


        return response.json({
            message : "upload profile",
            success : true,
            error : false,
            data : {
                _id : userId,
                avatar : upload.url
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//update user details
export async function updateUserDetails(request, response) {
  try {
    const userId = request.userId;
    const { name, email, mobile, password } = request.body;


    // Get the user first
    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({
        message: "User not found",
        error: true,
        success: false,
      });
    }


    // Build update object dynamically
    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }
    // Only include email if changed
    if (email && email !== user.email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        return response.status(400).json({
          message: "Email already used by another account",
          error: true,
          success: false,
        });
      }
      updateData.email = email;
    }


    await UserModel.updateOne({ _id: userId }, updateData);


    return response.json({
      message: "User updated successfully",
      success: true,
      error: false,
    });
  } catch (error) {
    return response.status(500).json({
      message: error.message,
      error: true,
      success: false,
    });
  }
}




//forgot password not login
export async function forgotPasswordController(request,response) {
    try {
        const { email } = request.body


        const user = await UserModel.findOne({ email })


        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }


        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr


        const update = await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp : otp,
            forgot_password_expiry : new Date(expireTime).toISOString()
        })


        await sendEmail({
            sendTo : email,
            subject : "Forgot password from AgroLink",
            html : forgotPasswordTemplate({
                name : user.name,
                otp : otp
            })
        })


        return response.json({
            message : "check your email",
            error : false,
            success : true
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//verify forgot password otp
export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body


        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }


        const user = await UserModel.findOne({ email })


        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }


        const currentTime = new Date().toISOString()


        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }


        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }


        //if otp is not expired
        //otp === user.forgot_password_otp


        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
       
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//reset the password
export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body


        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }


        const user = await UserModel.findOne({ email })


        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }


        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }


        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword,salt)


        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })


        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}




//refresh token controler
export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]


        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }


        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)


        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }


        const userId = verifyToken?._id


        const newAccessToken = await generatedAccessToken(userId)


        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }


        response.cookie('accessToken',newAccessToken,cookiesOption)


        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })




    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}


//get login user details
export async function userDetails(request,response){
    try {
        const userId  = request.userId


        console.log(userId)


        const user = await UserModel.findById(userId).select('-password -refresh_token')


        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}


export async function addPreferences(request, response) {
  try {
    const userId = request.userId; // from auth middleware
    const { category, subCategory } = request.body;

    if (!category || !subCategory) {
      return response.status(400).json({
        success: false,
        message: "Category and SubCategory are required",
        error: true
      });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return response.status(404).json({ 
        success: false, 
        message: "User not found",
        error: true 
      });
    }

    // Check if preference already exists
    const exists = user.preferences.some(
      p => p.category === category && p.subCategory === subCategory
    );

    if (exists) {
      return response.status(400).json({
        success: false,
        message: "This preference already exists",
        error: true
      });
    }

    user.preferences.push({ category, subCategory });
    await user.save();

    return response.json({ 
      success: true, 
      message: "Preference added successfully", 
      data: user.preferences,
      error: false
    });
  } catch (error) {
    console.error("🔴 Add Preference Error:", error);
    return response.status(500).json({ 
      success: false, 
      message: error.message || "Failed to add preference",
      error: true
    });
  }
}


export async function getPreferences(request, response) {
  try {
    const userId = request.userId;
    const user = await UserModel.findById(userId).select('preferences');
    if (!user) {
      return response.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    return response.json({
      success: true,
      data: user.preferences || [],
      message: "Preferences fetched successfully"
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
}

export async function deletePreference(request, response) {
  try {
    const userId = request.userId;
    const { preferenceId } = request.body;

    if (!preferenceId) {
      return response.status(400).json({
        success: false,
        message: "preferenceId is required",
        error: true
      });
    }

    const result = await UserModel.updateOne(
      { _id: userId },
      { $pull: { preferences: { _id: preferenceId } } }
    );

    if (result.modifiedCount === 0) {
      return response.status(404).json({
        success: false,
        message: "Preference not found",
        error: true
      });
    }

    return response.json({
      success: true,
      message: "Preference removed"
    });
  } catch (error) {
    return response.status(500).json({
      success: false,
      message: error.message || "Failed to remove preference",
      error: true
    });
  }
}


export async function adminUpdateUserController(request, response) {
  try {
    const requesterId = request.userId;
    // ensure requester exists and is admin
    const requester = await UserModel.findById(requesterId).select('role');
    if (!requester || requester.role !== 'ADMIN') {
      return response.status(403).json({ message: 'Access denied', success: false, error: true });
    }

    const { _id, name, email, mobile, password, role } = request.body;
    if (!_id) {
      return response.status(400).json({ message: 'User ID (_id) required', success: false, error: true });
    }

    const user = await UserModel.findById(_id);
    if (!user) {
      return response.status(404).json({ message: 'User not found', success: false, error: true });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (role) updateData.role = role;
    if (email && email !== user.email) {
      const exists = await UserModel.findOne({ email });
      if (exists) {
        return response.status(400).json({ message: 'Email already used by another account', success: false, error: true });
      }
      updateData.email = email;
    }
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    await UserModel.updateOne({ _id }, updateData);

    return response.json({ message: 'User updated successfully', success: true, error: false });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, success: false, error: true });
  }
}

export async function deleteUserController(request, response) {
  try {
    const requesterId = request.userId;
    // ensure requester exists and is admin
    const requester = await UserModel.findById(requesterId).select('role');
    if (!requester || requester.role !== 'ADMIN') {
      return response.status(403).json({ message: 'Access denied', success: false, error: true });
    }

    const { _id } = request.body;
    if (!_id) {
      return response.status(400).json({ message: 'User ID (_id) required', success: false, error: true });
    }

    const user = await UserModel.findById(_id);
    if (!user) {
      return response.status(404).json({ message: 'User not found', success: false, error: true });
    }

    await UserModel.deleteOne({ _id });

    return response.json({ message: 'User deleted successfully', success: true, error: false });
  } catch (error) {
    return response.status(500).json({ message: error.message || error, success: false, error: true });
  }
}

export async function resendVerificationEmail(request, response) {
    try {
        const { email } = request.body;

        if (!email) {
            return response.status(400).json({
                message: "Email is required",
                error: true,
                success: false
            });
        }

        const user = await UserModel.findOne({ email });

        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        if (user.verify_email) {
            return response.status(400).json({
                message: "Email already verified",
                error: true,
                success: false
            });
        }

        const VerifyEmailUrl = `${process.env.FRONTEND_URL}/verify-email?code=${user._id}`;

        await sendEmail({
            sendTo: email,
            subject: "Verify email from AgroLink",
            html: verifyEmailTemplate({
                name: user.name,
                url: VerifyEmailUrl
            })
        });

        return response.json({
            message: "Verification email sent successfully",
            error: false,
            success: true
        });

    } catch (error) {
        return response.status(500).json({
            message: error.message || error,
            error: true,
            success: false
        });
    }
}