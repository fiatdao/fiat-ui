const color_1 = '#00fee5'
const color_2 = '#f60087'
const color_3 = '#5319ff'
const color_4 = '#180722'
const color_5 = '#5300ff'
const color_6 = '#c384fe'
const color_6_rgb = 'rgb: 195, 132, 254'
const color_7_ = '#707070'
const color_7_rgb = 'rgb: 112, 112, 112'
const color_8 = '#3b1f4a'
const color_9 = '#180821'
const error = '#db3a3d'
const textColor = '#fff'

export const theme = {
  buttonHeight: '44px',
  buttonPrimary: {
    backgroundColor: '#fff',
    backgroundColorHover: '#fafafa',
    borderColor: '#ccc',
    borderColorHover: '#cacaca',
    color: '#000',
    colorHover: '#000',
  },
  card: {
    backgroundColor: '#fff',
    backgroundOpacity: '1',
    borderRadius: '12px',
  },
  colors: {
    color_1: color_1,
    color_2: color_2,
    color_3: color_3,
    color_4: color_4,
    color_5: color_5,
    color_6: color_6,
    color_6_rgb: color_6_rgb,
    color_7_: color_7_,
    color_7_rgb: color_7_rgb,
    color_8: color_8,
    error: error,
    mainBodyBackground: color_9,
    textColor: textColor,
  },
  dropdown: {
    background: '#fff',
    borderColor: '#ccc',
    borderRadius: '6px',
    boxShadow: '0 0 24px 0 rgba(0, 0, 0, 0.1)',
    item: {
      backgroundColor: 'transparent',
      backgroundColorActive: 'rgba(0, 0, 0, 0.05)',
      backgroundColorHover: 'rgba(0, 0, 0, 0.05)',
      borderColor: '#ccc',
      color: '#000',
      colorActive: '#000',
      height: '38px',
      paddingHorizontal: '12px',
    },
  },
  fonts: {
    defaultSize: '1.8rem',
    fontFamily: `"Rubik", "Helvetica Neue", "Arial", "Segoe UI", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "-apple-system",
    "BlinkMacSystemFont", sans-serif`,
    fontFamilyCode: `'source-code-pro', 'Menlo', 'Monaco', 'Consolas', 'Courier New', 'monospace'`,
  },
  footer: {},
  header: {
    height: '87px',
    heightMobile: '77px',
  },
  layout: {
    horizontalPaddingMobile: '20px',
    horizontalPaddingTabletPortraitStart: '25px',
    horizontalPaddingTabletLandscapeStart: '35px',
    horizontalPaddingDesktopStart: '50px',
    maxWidth: '1076px',
    maxWidthInner: '768px',
  },
  themeBreakPoints: {
    desktopStart: '1025px',
    desktopWideStart: '1281px',
    tabletLandscapeStart: '769px',
    tabletPortraitStart: '481px',
  },
}
