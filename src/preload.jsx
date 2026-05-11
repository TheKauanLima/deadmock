import {allIconFiles} from '/src/Icon';
import {backgroundOptions} from '/src/Background/backgrounds';

const remaining = [...allIconFiles];
const parallel = 10;

const nextPreload = () => {
  if (remaining.length > 0) {
    const path = remaining.pop();
    const img = new Image();
    img.addEventListener('load', () => nextPreload());
    img.src = `${import.meta.env.BASE_URL}icon/${path}`;
  }
};

for (let i = 0; i < parallel; i++) {
  nextPreload();
}

const preloadBackground = (path) => {
  const img = new Image();
  img.src = `${import.meta.env.BASE_URL}${path}`;
};

preloadBackground('temp_background_environment_png2.png');
for (const {file} of backgroundOptions) {
  preloadBackground(`background/${file}`);
}
