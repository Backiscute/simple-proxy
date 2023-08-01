const express = require("express")
const axios = require("axios").default
const cors = require("cors")

const PORT = 8080, AUTHORIZATION = ""

const server = express().disable("x-powered-by").enable("trust proxy").use(express.json(), cors({
    origin: "*"
}))

server.all("/:url", async (req, res, next) => {
    if (AUTHORIZATION && req.headers.authorization !== AUTHORIZATION) return next()
    try {
        if (!/^(https:\/\/www\.|http:\/\/www\.|https:\/\/|http:\/\/)?[a-zA-Z0-9]{2,}(\.[a-zA-Z0-9]{2,})(\.[a-zA-Z0-9]{2,})?\/[a-zA-Z0-9]{2,}$/.test(req.params.url)) return res.status(400).json({
            code: "ERR_BAD_URL",
            url: req.params.url
        })
        delete req.headers.host
        const response = await axios({
            url: req.params.url,
            method: req.method.toLowerCase(),
            headers: req.headers,
            data: req.body
        })
        for (const [k,v] of Object.entries(response.headers)) res.setHeader(k,v)
        res.status(response.status).send(response.data)
    } catch (e) {
        if (e.response) {
            for (const [k,v] of Object.entries(e.response.headers)) res.setHeader(k,v)
            res.status(e.response.status).send(e.response.data)
        } else res.status(501).json({
            code: e.cause.code,
            url: req.params.url
        })
    }
})
server.use("*", (req, res) => res.sendStatus(404))

server.listen(PORT, () => console.log("Listening on port " + PORT))