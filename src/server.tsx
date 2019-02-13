import { render } from '@jaredpalmer/after';
import * as k8s from '@kubernetes/client-node';
import express from 'express';
import httpProxyMiddleware from 'http-proxy-middleware';
import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import routes from './routes';
import { setNamespace } from './services/kube';
import { StyleProvider } from './StyleProvider';

if (!process.env.RAZZLE_ASSETS_MANIFEST) {
  throw new Error('No RAZZLE_ASSETS_MANIFEST');
}

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST);

function makeAssetTags(asset: any, name: string) {
  let ret = '';
  if (asset[name]) {
    if (asset[name].css) {
      ret += `<link rel="stylesheet" href="${assets[name].css}"/>\n`;
    }
    if (asset[name].js) {
      ret += `<script type="text/javascript" src="${assets[name].js}"></script>`;
    }
  }
  return ret;
}

const server = express();

const kc = new k8s.KubeConfig();
kc.loadFromDefault();
const contextName = kc.getCurrentContext();
const context = kc.getContextObject(contextName);
const namespace = context && context.namespace;
if (namespace) {
  setNamespace(namespace);
}

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR || 'static'))
  .use('/api/kube', httpProxyMiddleware({
    target: 'http://localhost:8080',
    pathRewrite: {
      ['^/api/kube']: '',
    },
    logLevel: 'debug',
    changeOrigin: true,
    secure: false,
    // onProxyReq: (proxyReq) => {
    //   proxyReq.setHeader('Authentication', `Beare ${user.token}`);
    // }
  }))
  .get('/*', async (req, res) => {
    const css: Array<{ id: string; css: string; }> = [];
    const insertCss = (...styleList: any[]) => styleList.forEach((style) => {
      if (style._getContent) {
        const content = style._getContent();
        content.forEach((c: any) => {
          css.push({
            id: c[0],
            css: c[1],
          });
        });
      }
    });
    const html = await render({
      req,
      res,
      routes,
      assets,
      // Anything else you add here will be made available
      // within getInitialProps(ctx)
      // e.g a redux store...
      customRenderer: (element) => {
        return {
          html: ReactDOMServer.renderToString((
            <StyleProvider insertCss={insertCss}>
              {element}
            </StyleProvider>
          ))
        };
      },
      ...{
        namespace
      }
    });
    // console.log(assets, css);
    const htmlWithCommonCss = (html || '')
      .replace(
        '</head>', 
        `
        ${makeAssetTags(assets, 'vendor')}
        ${makeAssetTags(assets, 'common')}
        </head>`);
    if (css.length) {
      const styleStrs = css
        .map((s) => `<style text="text/css" id="s${s.id}-0">${s.css}</style>`)
        .join('');
      res.send(
        htmlWithCommonCss
          .replace('</head>', `${styleStrs}</head>`));
      return;
    }
    res.send(htmlWithCommonCss);
  });

export default server;
