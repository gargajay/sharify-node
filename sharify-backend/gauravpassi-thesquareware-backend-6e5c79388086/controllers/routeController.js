 

class RouteController {
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

	 
} 

const routeController = (userRouter) => {
	return new RouteController(userRouter);
};

module.exports = {
	RouteController,
	routeController,
};