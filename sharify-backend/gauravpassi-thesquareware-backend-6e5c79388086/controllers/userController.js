const RouteController = require("./routeController").routeController; 



class UserController extends RouteController{
	constructor(userRouter) {
		this.userRouter = userRouter;
		this.registerRoutes();
	} 

	registerRoutes() {
		this.userRouter.get("/register", this.renderRegistrationPage);
		// this.userRouter.post("/register",upload.single("profile"),this.registerUser.bind(this));
		this.userRouter.get("/login", this.renderLoginPage);
		this.userRouter.post("/login", this.loginUser);
		this.userRouter.get("/hello", this.hello);
	}

	async hello(req, res){
		console.log('fe');
	}
	renderRegistrationPage(req, res) {
		res.render("account/register");
	}

	renderLoginPage(req, res) {
		res.render("account/login");
	}
	async registerUser(req, res) {
		const fullName = req.body.full_name;
		const userName = req.body.user_name;
		const password = req.body.password;
		const email = req.body.email;
		const profilePic = req.file.originalname;

		try {
			if (!userName) {
				throw "Parameter missing user_name";
			}
			if (!email) {
				throw "Parameter missing email";
			}
			if (!fullName) {
				throw "Parameter missing full_name";
			}

			if (!password) {
				throw "Parameter missing password";
			}

			if (!this.isEmailValid(email)) {
				throw "Invalid Email";
			}

			const image = await Jimp.read(`uploads/${profilePic}`);
			const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);
			// crop function using callback function
			image
				.crop(1500, 500, 150, 150, function (err) {
					if (err) throw err;
				})
				.print(font, 10, 10, "Asferasoft", (err) => {
					if (err) throw err;
				})
				.write(
					`/Users/nikhil/Desktop/esferasoft-intreview-task/afterCropWithJimp/${profilePic}`
				);
			const user = await userDAO.getUserWithEmailId(email);
			if (user) {
				throw "User allready registered";
			}
			const hashPassword = await passwordService.hashPassword(
				req.body.password
			);
			const params = {
				email: email,
				password: hashPassword,
				fullName: fullName,
				userName: userName,
				profile: profilePic,
			};
			await userDAO.createUser(params);

			res.render("account/success", {
				userName: userName,
				password: password,
				successMessage: "Register successfully",
			});
		} catch (err) {
			res.render("account/error", {
				error: err,
			});
		}
	}
	async loginUser(req, res) {
		const email = req.body.email;
		const password = req.body.password;
		try {
			if (!email) {
				throw "Parameter missing email";
			}

			if (!password) {
				throw "Parameter missing password";
			}

			const user = await userDAO.getUserWithEmailId(email);
			if (!user) {
				throw "User not registered";
			}
			await passwordService.verifyPassword(password, user.passwordHash);

			const token = await jwtService.generateToken({
				userId: user.id,
				username: user.userName,
			});
			await tokenService.setToken(user.id, token, authConfig.tokenExpiry);

			res.render("account/success", {
				userName: "",
				password: "",
				successMessage: "Login successfully",
			});
		} catch (err) {
			res.render("account/error", {
				error: err,
			});
		}
	}
	 
} 

const userController = (userRouter) => {
	return new UserController(userRouter);
};

module.exports = {
	UserController,
	userController,
};