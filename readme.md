# Icons
An npm package to use as WordPress Block Editor icon components.

## Install
```bash
npm install @csuclawebservices/icons
```

## Usage

### As Icon Component
```js
import { Icon } from '@wordpress/icons';
import { layout1 } from '@csuclawebservices/icons';

return (
	<Icon icon={layout1}/>
);
```

### As Block Icon
```js
import {registerBlockType } from '@wordpress/blocks';
import { layout1 } from '@csuclawebservices/icons';

import metadata from './block.json';
import edit from './edit';
import save from './save';

registerBlockType( metadata.name, {
	icon: layout1,
	edit,
	save
});
```

## License
This project is licensed under the GPL 2.0 License - see the [LICENSE](LICENSE) file for details.

## Copyright

© 2022 GoDaddy. Original build.js.
© 2024 John Russell, Colorado State University. All rights reserved.