//controller/adminAuthController




// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });

//         if (!user || !(await bcrypt.compare(password, user.password))) {
//             return res.status(401).json({ message: "Invalid email or password" });
//         }

//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//         res.status(200).json({ message: "Login successful", token, role: user.role });
//     } catch (error) {
//         res.status(500).json({ message: "Internal Server Error" });
//     }
// };