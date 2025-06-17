import validator from 'validator';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
//login and register user


const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

//route for user login
const loginUser = async(req, res) => {
    try {
        
        const { username, password } = req.body;

        // Check if user exists
        const user = await userModel.findOne({username});

        if (!user) {
            return res.json({success: false, message: "User doesn't exist"});
        }

        // Check if password is correct
        const isMatch = await bcrypt.compare(password, user.password);

        if(isMatch){
            //create token
            const token = createToken(user._id);
            res.json({success: true, token});
        }
        else {
            res.json({success: false, message: "Invalid credentials"});
        }


    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}


//route for user registration
const registerUser = async(req, res) => {
    try {

        const { firstName, lastName, username, email, password, address, phoneNumber } = req.body;

        // Check if user already exists
        const exists = await userModel.findOne({email}) //email is unique
        if (exists) { //kl udh ada
            return res.json({success: false, message: "User already exists"});
        }

        //validating email format & strong password
        if(!validator.isEmail(email)) {
            return res.json({success: false, message: "Please enter a valid email address"});
        }

        if(password.length < 8) {
            return res.json({success: false, message: "Please enter a strong password (at least 8 characters)"});
        }

        //hashing password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);



        //kl gaada masalah w/ email & password, create new user
        const newUser = new userModel({
            firstName,
            lastName,
            username,
            email,
            password: hashedPassword,
            address,
            phoneNumber
        });

        const user = await newUser.save();
        
        const token = createToken(user._id);

        res.json({
            success: true,
            token
        });

    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

//route for admin login
const adminLogin = async(req, res) => {
    try {
        const { email, password } = req.body;

        if(email ===  process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            //create token
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success: true, token});
        }else{
            res.json({success: false, message: "Invalid credentials"});
        }
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: error.message
        });
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await userModel.findById(userId).select('-password');
    
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, username, email, address, phoneNumber } = req.body;
    
    const user = await userModel.findByIdAndUpdate(
      userId, 
      { firstName, lastName, username, email, address, phoneNumber },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message
    });
  }
};

export { loginUser, registerUser, adminLogin, getUserProfile, updateUserProfile};