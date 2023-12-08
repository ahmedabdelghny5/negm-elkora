import jwt from 'jsonwebtoken'
import { AppError } from '../utils/globalError.js';
import { asyncHandler } from '../utils/globalError.js';
import childModel from '../../DB/models/child.model.js';
import captainModel from './../../DB/models/captain.model.js';

export const role = {
    Child: ["Child"],
    Admin: ["Admin"],
    captain: ["Captain"]
}

// export const auth = (accesRoles = []) => {
//     return asyncHandler(async (req, res, next) => {
//         const { token } = req.headers;
//         if (!token) {
//             return next(new AppError("token not found", 404))
//         }
//         if (!token.startsWith(process.env.SecretKey)) {
//             return next(new AppError("invalid secret key", 400))
//         }
//         const mainToken = token.split(process.env.SecretKey)[1];
//         const decoded = jwt.verify(mainToken, process.env.signature)
//         if (!decoded?.id) {
//             return next(new AppError("invalid token payload", 400))
//         }

//         if (!accesRoles.includes(decoded.role)) {
//             return next(new AppError("not authorized user ", 400))
//         }
//         let user;
//         if(decoded.role == "Child"){
//             user =  await childModel.findById(decoded.id)
//         }
//         if(decoded.role=="Captin"){
//             user =  await captainModel.findById(decoded.id)
//         }
//         if (!user?.confirmed) {
//                 return next(new AppError('user not found or not confirmed', 404))
//             }
//         if (parseInt(user?.changePassAt?.getTime() / 1000) > decoded.iat) {
//             return next(new AppError("token expired after change password plz log in again with new password"))
//         }
//         req.user = user
//         next()
//     })

// }
export const auth = (roles) => {
    return async (req, res, next) => {
      try {
        const { authorization } = req.headers;
        if (!authorization) {
          return next(new Error("Please login first", { cause: 400 }));
        }
  
        if (!authorization.startsWith("ecomm__")) {
          return next(new Error("invalid token prefix", { cause: 400 }));
        }
  
        const splitedToken = authorization.split("ecomm__")[1];
        try {
          
          const decodedData = verifyToken({
            token: splitedToken,
            signature: process.env.SIGN_IN_TOKEN_SECRET,
          });
  
          
          console.log({ decodedData });
          const findUser = await userModel.findById(
            decodedData._id,
            "email userName role"
          );
          if (!findUser) {
            return next(new Error("Please SignUp", { cause: 400 }));
          }
  
          //============================== authorization ============
          // console.log(roles)
          // console.log(findUser.role)
  
          if (!roles.includes(findUser.role)) {
            return next(new Error("Unauthorized user", { cause: 401 }));
          }
  
          req.authUser = findUser;
          next();
        } catch (error) {
          // token  => search in db
          if (error == "TokenExpiredError: jwt expired") {
            // refresh token
            const user = await userModel.findOne({ token: splitedToken });
            if (!user) {
              return next(new Error("Wrong token", { cause: 400 }));
            }
            // generate new token
            const userToken = generateToken({
              payload: {
                email: user.email,
                _id: user._id,
              },
              signature: process.env.SIGN_IN_TOKEN_SECRET,
              expiresIn: "1h",
            });
  
            if (!userToken) {
              return next(
                new Error("token generation fail, payload canot be empty", {
                  cause: 400,
                })
              );
            }
  
            // user.token = userToken
            // await user.save()
            await userModel.findOneAndUpdate(
              { token: splitedToken },
              { token: userToken }
            );
            return res
              .status(200)
              .json({ message: "Token refreshed", userToken });
          }
          return next(new Error("invalid token", { cause: 500 }));
        }
      } catch (error) {
        console.log(error);
        next(new Error("catch error in auth", { cause: 500 }));
      }
    };
  };