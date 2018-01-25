let gcmSenderId = appRequire('services/config').get('plugins.webgui.gcmSenderId');
if(gcmSenderId) { gcmSenderId = gcmSenderId.toString(); }

const manifest = {
  short_name: 'Greentern',
  name: 'Greentern',
  icons: [
    {
      src: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '48x48'
    },
    {
      src: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '128x128'
    },
    {
      src: '/favicon.ico',
      type: 'image/x-icon',
      sizes: '144x144'
    },
    {
      src: '/favicon.ico',
      type: 'image/x-icon',
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
