# HtmlInColumns

HtmlInColumns is a javascript that put html in columns. 

It follow some of the basic rules of typografy, like avoiding orphans and widows, don't put a header as the last element in a column etc.

## External libraries

HtmlInColumns use jquery for doing dom stuff. Otherwise it dosen't use external libraries.

## Get started

If you want to take a look in the code look in the src folder. 

If you just wil get up and running grab the HtmlInColumns.min.js from the dist folder and take a look at the demo.

Basicly all you need to do is:
- Include the script on your page
- Put your html i a div with an id (eg Content)
- Add the following script to your page:

```javascript
$(document).ready(function () {
            var content = Object.create(HtmlInColumns);
            content.init({ containerID: "#Content" });
            content.render();
        });
```