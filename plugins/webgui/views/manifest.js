let gcmSenderId = appRequire('services/config').get('plugins.webgui.gcmSenderId');
if(gcmSenderId) { gcmSenderId = gcmSenderId.toString(); }

const manifest = {
  short_name: 'Greentern',
  name: 'Greentern',
  icons: [
    {
      src: '/assets/greentern_48x48.png',
      type: 'image/png',
      sizes: '48x48'
    },
    {
      src: '/assets/greentern_128x128.png',
      type: 'image/png',
      sizes: '128x128'
    },
    {
      src: '/assets/greentern_144x144.png',
      type: 'image/png',
      sizes: '144x144'
    },
    {
      src: '/assets/greentern_256x256.png',
      type: 'image/png',
      sizes: '256x256'
    }
  ],
  start_url: '/',
  display: 'standalone',
  background_color: '#2196F3',
  theme_color: '#2196F3',
  gcm_sender_id: gcmSenderId,
};

exports.manifest = manifest;
