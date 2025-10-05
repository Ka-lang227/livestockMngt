const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/userController');

const { 
    signup,
    verifyEmail, 
    login,
    protect,
    restrictTo,
    resetPassword,
    forgotPassword,
    updatePassword,

} = require('../controllers/authController');

router.post('/login', login);
router.post('/signup', signup);
router.get('/verifyEmail/:token', verifyEmail);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.use(protect);

router.patch('/updateMyPassword', updatePassword);

router.use(restrictTo('admin'));

router
    .route('/')
    .get(getAllUsers)
    .post(createUser);


router  
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router;