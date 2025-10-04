# OCR-B Monospace Font

OCR-B is a monospace font originally developed in 1968 by Adrian Frutiger. This distribution brings many improvements. Extremely useful for documents in Eastern-European countries.

## CDN

CSS import of the latest version
```css
@font-face {
  font-family: "OCR-B";
  src: url(https://cdn.jsdelivr.net/gh/raisty/OCR-B/dist/OCR-B.ttf) format("truetype"),
       url(https://cdn.jsdelivr.net/gh/raisty/OCR-B/dist/OCR-B.otf) format("opentype");
}
```

CSS with Minor updates and patch fixes within a major version
```css
@font-face {
  font-family: "OCR-B";
  src: url(https://cdn.jsdelivr.net/gh/raisty/OCR-B@1/dist/OCR-B.ttf) format("truetype"),
       url(https://cdn.jsdelivr.net/gh/raisty/OCR-B@1/dist/OCR-B.otf) format("opentype");
}
```

Using SRI with exact version
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/raisty/OCR-B@1.1/dist/ocrb.css" integrity="sha384-{hash}" crossorigin="anonymous" />
```

> Please, replace {hash} with hash generated for chosen specific version. You can use for example this [SRI Hash Generator](https://www.srihash.org/).
