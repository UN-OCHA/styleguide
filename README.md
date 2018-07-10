# UNOCHA Front end style guide

This site is an evolving list of components and resources for OCHA websites.

The guide is a living document created to meet the needs of OCHA's developers and designers. If you have any feedback, questions or comment please contact digitalservices@humanitarianresponse.info.

## Contents

### Common Design

The [Common Design](https://un-ocha.github.io/styleguide/common-design) is a unified design system for OCHA platforms.

### OCHA Basic Drupal Theme

[OCHA Basic](https://un-ocha.github.io/styleguide/ocha) is a minimal starter theme for Drupal incorporating the Common Design header and footer.

### Individual website component libraries

The individual component libraries are intended to document the front end for the project.

[Humanitarian ID component library & guidelines](https://un-ocha.github.io/styleguide/hid)

[ReliefWeb component library & guidelines](https://un-ocha.github.io/styleguide/reliefweb)

### Shared libraries

[Icon library](https://un-ocha.github.io/styleguide/icons)

## Related links

[OCHA Basic Drupal Theme](https://github.com/UN-OCHA/ocha_basic)

[UNOCHA Graphics Style Book (pdf)](https://www.unocha.org/sites/unocha/files/dms/Documents/GraphicsStyleBook_for_public.pdf)

## Running locally

This site uses Jekyll. See [https://jekyllrb.com](https://jekyllrb.com) for Jekyll docs.

### Requirements

* [Ruby](https://www.ruby-lang.org/en/)
* [Bundler](http://bundler.io/)
* [Node](https://nodejs.org/)
* [Jekyll](https://jekyllrb.com)
* [Grunt CLI](https://gruntjs.com/getting-started)

### Clone the repo

```
git clone git@github.com:UN-OCHA/styleguide.git
```

### Install the required gems

```
rvm use
bundle install
```

If you run into issues installing `nokogiri` try following the package installation/upgrade commands for your system in this [nokogiri GitHub issue](https://github.com/sparklemotion/nokogiri/issues/1099).

### Install the front end dependencies

```
nvm use
npm install
```

### Running

To run the Jekyll site:

```
npm run jekyll
```

Visit http://localhost:4000/

### CSS & Sass

Grunt is used to generate CSS used in the styleguide from Sass.

Run `grunt` to generate:

* styleguide styles
* OCHA Basic extras styles
* Common Design styles

`grunt watch` can be used to watch for changes to the above.

### Individual project CSS

#### ReliefWeb

The ReliefWeb section uses styles copied from the ReliefWeb repository.

Run `npm run update-rw-assets` to update the ReliefWeb assets (assumes you have the ReliefWeb code at /srv/rwint/data/code/).

#### HID assets

The HID section uses styles from the HID staging site.

#### OCHA Basic assets

The OCHA Basic section uses styles from the OCHA Basic github repo.
