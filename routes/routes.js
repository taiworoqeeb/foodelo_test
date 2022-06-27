const express = require("express");
const router = express.Router();
const {Register, LoginUser, resendCode, resetPassword1, resetPassword2, emailVerify, userAuth, checkRole} = require("../controller/Authentication");
const {addCartItem, removeCartItem, getCart} = require("../controller/cart");
const {addProduct, getProduct} = require("../controller/productlistng");

router.post("/register-user", async (req, res, next) => {
    await Register("user", req, res, next);
  });

router.post("/register-admin", async (req, res, next) => {
await Register("admin", req, res, next);
});

router.post("/signin-admin", async (req, res, next) => {
    await LoginUser(
     "admin",
      req,
      res,
      next
    );
  });

  router.post("/signin-user", async (req, res, next) => {
    await LoginUser(
     "user",
      req,
      res,
      next
    );
  });

router.post("/resendCode", userAuth, resendCode);
router.post("/verifyEmail", userAuth, emailVerify);
router.post("/resetPassword1",userAuth, resetPassword1);
router.post("/resetPassword2", userAuth, resetPassword2);
router.post("/addProduct", userAuth, addProduct);
router.get("/homepage", userAuth, getProduct);

router.post("/addtocart/:productId", userAuth, addCartItem);
router.delete("/removefromcart/:cartitemId", userAuth, removeCartItem);
router.get("/getCart", userAuth, getCart);

module.exports = router;

