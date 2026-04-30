IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.
IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.
IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.

When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
Do only what requested.




I would like to redesign this plugin:

This plugin was designed to redirect the new tab to a custom URL.
But now we have to render that page ourself in the plugin.

So once user click the new tab button we should render that page ourself from plugin and have it under control in the plugin.

It will no longer be just redirecting to some custom webpage.

That page should be single html file self contained.

Let's start from here.

# persistance

We have to create some primitives to store some states of our page.

The idea is to store our states in the bookmarks.

we will reserve folder by name "_" in the bookmarks bar.

In bookmarks we can only store folders and links and folders have only name
and bookmarks have two fields 'name' and 'url'. 

Also what I've discovered is that name can be empty string '',
But url cannot be empty string ''.

So when we will create a bookmark we will always have something for name but if there will be nothing defined for url let's stick to default value "chrome://new-tab-page" and that value will later be treated as null when deserializing, unless anything else is there. then it will be treated as that string with that other value.
But "chrome://new-tab-page" means value was not set and this is default.

So first of all we will store just flat list of links in "_" folder.

We will serialize data in such way:

Allow me to store data like so;

It seems bookmarks allow duplicated names and urls, also it allows to have more than one bookmark with the same name AND the same url.

So let's acknowledge that this is not a limitation.

Now we will store just flat list of links in "_" folder.

and we will allow user to store such object in the bookmark:

```

{
    type: string,  - required
    url?: string,  - optional
    [string]?: string - optional, any other field
}

```

Where 'type' will be mandatory

and will define how this particular bookmark should be interpreted and rendered.

url will be optional as above.

Any other field can be defined too.

Now once user define such object. we have to have two functions to serialize and deserialize data to store in bookmark name field.

```
function serialize(data: any): string
function deserialize(data: string): any

create these as separate files in the 'extension' directory and load to the extension/homepage.html

but I will have to have tests for these two functions as well

```