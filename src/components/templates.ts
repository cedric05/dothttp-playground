

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
        "name": "Post with json payload",
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
        "name": "Put with json payload",
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
        "name": "Triple Quote json",
        "template": `
@name("Triple Quotes")
POST "https://httpbin.org/post"
json({
    "hai": """this string can have quotes
like "this" with out escapes
and also like 'this'
})`   ,
        default: false,
    },
    {
        "name": "payload breaks",
        "template": `
@name("text breaks")
POST "https://httpbin.org/post"
data(
"this is text"
// here is break
"""this is continuation"""
// this way user can have comments relavent to that section
)`   ,
        default: false,
    },
    {
        "name": "XML payload",
        "template": `
@name('xml payload')
POST "https://httpbin.org/post"
"Content-Type" : "application/xml"
data(
"""
<?xml version='1.0' encoding='us-ascii'?>

<!--  A SAMPLE set of slides  -->

<slideshow 
    title="Sample Slide Show"
    date="Date of publication"
    author="Yours Truly"
    >

    <!-- TITLE SLIDE -->
    <slide type="all">
        <title>Wake up to WonderWidgets!</title>
    </slide>
"""
// you can define anything here
/*
"""
    <slide type="all">
    <title>this is commented and, easily taken back</title>
    </slide>
"""
*/

"""
    <!-- OVERVIEW -->
    <slide type="all">
        <title>Overview</title>
        <item>Why <em>WonderWidgets</em> are great</item>
        <item/>
        <item>Who <em>buys</em> WonderWidgets</item>
    </slide>

</slideshow>
"""
)
        
`   ,
        default: false,
    },
    {
        "name": "Simple Curl",
        "template": `
# {{baseUrl=api.github.com}}
# {{username=cedric05}}
@name("List events for the authenticated user")
curl -X GET "https://{{baseUrl}}/users/{{username}}/events"
# checkout https://github.com/cedric05/try-github-apis
`   ,
        default: false,
    },
 {
        "name": "Breaks in json",
        "template": `
POST "https://httpbin.org/post"
json({
    "somekey": "some value
"
        // some comment
            "other value"
})
`   ,
        default: false,
    },
 {
        "name": "Graph QL Example",
        "template": `
POST 'https://api.spacex.land/graphql' 
json({
    "query":
        """{
          company {
            ceo
            coo
            cto_propulsion
            cto
            """
            // "employees"
            """
            founded
            founder
            launch_sites
            name
            summary
            test_sites
            valuation
            vehicles
          }
        }
  """,
  "variables":null}
)
`   ,
        default: false,
    },
    {
        "name": "Extend From Base",
        "template": `
// because of dothttp-playground limitation
// it will always run first request (it can be fixed based on usage)

# {{baseUrl=api.github.com}}
# {{username=cedric05}}

@name("List events for the authenticated user"): "test"
GET "/users/{{username}}/events"
? "per_page"= "30"
? "page"= "1"    

@name("test") 
GET "https://{{baseUrl}}/"

`   ,
        default: false,
    },
    
    
    


]
