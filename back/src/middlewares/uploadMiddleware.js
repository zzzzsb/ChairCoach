// (FE요청) 삭제
// import multer from "multer";
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // cb(null, "uploads/");
//     cb(null, "./uploads");
//   },
//   filename: function (req, file, cb) {
//     const originalname = file.originalname.split(".");
//     const ext = originalname[originalname.length - 1];
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext);
//   },
// });
// const upload = multer({ storage: storage });
// export = upload;
