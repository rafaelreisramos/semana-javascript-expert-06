import server from "./server.js"

server.listen(3000).on("listening", () => console.info("Server is running"))
