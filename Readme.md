# react-native-ruler-slider

[![NPM version][npm-image]][npm-url]
[![Build][github-build]][github-build-url]
![npm-typescript]
[![License][github-license]][github-license-url]

## Installation:

```bash
npm install react-native-ruler-slider
```

or

```bash
yarn add react-native-ruler-slider
```

## Usage

Proper Usage of the following Components can decrease load time & render time & create a smooth app

```js

import RulerSlider from 'react-native-ruler-slider';

...
    <RulerSlider 
        start={0} // <-- Required
        end={100} // <-- Required
        step={1}
        defaultValue={50}
        disabled={false}
        onChange={value=>setValue(value)}
        renderBar={(value,index)=><Element/>}
        renderPointer={()=><ElementMarker/>}
        onSlidingStart={()=>{}}
        onSlidingEnd={()=>{}}
  />
...

```

## Authors

- [@niteshdangi](https://www.github.com/niteshdangi)

## License

[MIT](https://choosealicense.com/licenses/mit/)


> **Warning**
>
> Do not Overuse in one component

[npm-url]: https://www.npmjs.com/package/react-native-ruler-slider
[npm-image]: https://img.shields.io/npm/v/react-native-ruler-slider
[github-license]: https://img.shields.io/github/license/niteshdangi/react-native-ruler-slider
[github-license-url]: https://github.com/niteshdangi/react-native-ruler-slider/blob/main/LICENSE
[github-build]: https://github.com/niteshdangi/react-native-ruler-slider/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/niteshdangi/react-native-ruler-slider/actions/workflows/publish.yml
[npm-typescript]: https://img.shields.io/npm/types/react-native-ruler-slider