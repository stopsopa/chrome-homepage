IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.
IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.
IMPORTANT: First of all don't run anything. just do what I ask and do as precisely as you can and then I will test it.

When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
When it comes to layout, keep it as raw html as possible. Don't do any not requested styling.
Do only what requested.


First of all always assume I have transpiler running against any *.ts file in extension directory

so every *.ts file is transpiled to *.js there.

example extension/encode.ts -> extension/encode.ts

so always use extension/encode.js

in homepage.html and sandbox.html use native esm to load these modules

when you need transpile run

/bin/bash build.sh

or just ask for it - I would prefer if you ask for it


also be aware that there is extension/modules.js

which is always built from extension/modules.ts

this is module wich is meant to combine all modules (bundle them) to deliver in one go to the browser context - so register there all modules you add



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

Now we will store just flat list of bookmarks in "_" folder.

we have two methods to work with createing final name and url from any given object:

- extension/encode.ts
- extension/decode.ts

We will work around these two files.

First of all we will create sandbox for testing which can be opened by pressing CTRL+ALT+T when extension/homepage.html is loaded in the browser

then we will load sandbox.html

In sandbox let's create simple list (like classic todo list) - keep html raw.

That list will allow us to define list of bookmarks in the "_" directory 

(create "_" directory if doesn't exist)

and we can click "+" button next to the list and then on the right form will open where we have to define 'type' and optionally url, and ui will allow us to add any number of extra fields 'key' 'value' 
and we will collect all of that and store in bookmark in "_"

and when we go back to sandbox.html each bookmakr shold load on the list and on the right for each element on the list should be delete and edit button.

delete should show confirmation - use native confirm() primitive to guard this.

'edit" button should deserialise given bookmark and populate form for edit. 

pressing 'save' shold replace that bookmark with edited data.

if possible also save it on the same place (order wise)

keep all simple, also make it also simple as possible regarding how it will communicate with browser under the hood.



```