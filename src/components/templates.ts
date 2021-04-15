

export default [
    {
        "name": "Get with Params",
        "template": `@name("Get with Params")
GET https://httpbin.org/get
? key1 = value2
? key2 = value2
? key3 = "value2 with spaces"
? key4 = 'value2 with single quotes'`,
        "default": true,
    },
    {
        "name": "Simple Post",
        "template": `POST https://httpbin.org/post
json({
    "name": "john don",
    "age" : 20
    })`,
        "default": true,
    },
    {
        "name": "Put with json",
        "template": `PUT https://httpbin.org/post
json({
    "name": "john don",
    "age" : 20
   })`,
        "default": true,
    },
    {
        "name": "Post with Binary",
        "template": `POST https://req.dothttp.dev
fileinput('C:\Users\john\documents\movie.mkv')`,
        "default": true,
    },
    {
        "name": "simple get5",
        "template": `@name(Get5)
GET https://httpbin.org/get`,
        "default": true,
    },
]