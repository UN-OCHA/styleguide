# Front end style guide

Jekyll site for styleguides.

See [https://jekyllrb.com](https://jekyllrb.com) for Jekyll docs.

## Github pages site

[https://un-ocha.github.io/styleguide/](https://un-ocha.github.io/styleguide/)

## Running locally

```
cd docs
jekyll serve --baseurl=""
```

Visit http://localhost:4000/

## Styleguide CSS

Grunt is used to generate CSS used in the styleguide from Sass.

Run `grunt` to generate:

* styleguide styles
* OCHA Basic extras styles
* Common Design styles

`grunt watch` can be used to watch for changes to the above.

## ReliefWeb assets

The ReliefWeb section uses styles copied from the ReliefWeb repository.

Run `npm run update-rw-assets` to update the ReliefWeb assets (assumes you have the ReliefWeb code at /srv/rwint/data/code/).

## HID assets

The HID section uses styles from the HID staging site.

## OCHA Basic assets

The OCHA Basic section uses styles from the OCHA Basic github repo.
