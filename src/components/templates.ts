

export default [
    {
        "name": "Github Users",
        "template": `
# {{baseUrl=api.github.com}}
# {{username=cedric05}}

@name("List events for the authenticated user")
GET "https://{{baseUrl}}/users/{{username}}/events"
? "per_page"= "30"
? "page"= "1"    
# checkout https://github.com/cedric05/try-github-apis
`   ,
        default: false,
    },
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
        "name": "POST with json payload",
        "template": `@name("POST with json payload")
POST https://httpbin.org/post
json({
    "name": "john don",
    // "interests" : "cedric",
    "age" : 20
    })
//data({
  //  "name": "john don",
    // "interests" : "cedric",
    //"age" : 20
    //})    `,
        "default": true,
    },
    {
        "name": "PUT with json payload",
        "template": `@name("PUT with json payload")
PUT https://httpbin.org/put
json({
    "name": "john don",
    "age" : 20
   })`,
        "default": true,
    },
    {
        "name": "Post with text payload",
        "template": `@name("Post with text payload")
POST https://httpbin.org/post
data('this is payload')`,
        "default": true,
    },
    //     {
    //         "name": "Post with Binary payload",
    //         "template": `POST https://req.dothttp.dev
    // fileinput('C:\Users\john\documents\movie.mkv')`,
    //         "default": true,
    //     },
    {
        "name": "Post with multipart payload",
        "template": `@name("Post with multipart payload")
POST https://httpbin.org/post
files(
    ("name", "john"),
    ("lastname", "doe"),
    ("filename", "<filename>")
)`,
        "default": true,
    },
    {
        "name": "Post with urlencoded",
        "template": `@name("Post with urlencoded")
POST https://httpbin.org/post
data({
    "name": "john don",
    "age" : 20
    })`,
        "default": true,
    },
    {
        "name": "variables",
        "template": `@name("variables")
POST https://httpbin.org/post
json({
    "firstName": "{{firstname=john}}",
    "lastName": "{{lastname=doe}}",
    "fullName": "{{firstname}} {{lastname}}",
    // "fullName" : "john doe"
    "age" : {{age=30}},
    "interests" : [
        "reading",
        // "hiking",
        "cricket"
    ]
})`,
        "default": true,
    },
    {
        "name": "no escape multiline",
        "template": `@name("no escape")
POST https://httpbin.org/post
data('''

"can have double quotes"

'can have single quotes'

"'can have these'"

''')`,
        "default": true,
    },
    {
        "name": "quoted json",
        "template": `
# {{baseUrl=api.github.com}}
# {{username=cedric05}}

@name("List events for the authenticated user")
GET "https://httpbin.org/post"
json({
    "hai": """this string can have quotes
like "this" with out escapes
and also like 'this'
})`   ,
        default: false,
    },

]
