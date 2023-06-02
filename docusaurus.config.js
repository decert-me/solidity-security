// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Decert.me',
  tagline: 'Solidity 合约安全',
  favicon: '/img/favicon.ico',
  scripts: [
    {
      src: "https://s9.cnzz.com/z_stat.php?id=1281242163&web_id=1281242163",
      async: true,
      defer: true
    },
  ],
  // Set the production url of your site here
  url: 'https://decert.me',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/tutorial/solidity-security/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'decert.me', // Usually your GitHub org/user name.
  projectName: 'decert.me', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/decert-me/blockchain-basic/tree/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Decert.me',
        logo: {
          alt: 'Decert Logo',
          src: 'img/logo.png',
        },
        // 顶部菜单
        items: [
          {
            type: 'doc',
            docId: 'start',
            position: 'left',
            label: '合约安全',
          },
          {
            href: 'https://github.com/decert-me/solidity-security',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: '教程',
            items: [
              {
                label: '合约安全',
                to: '/start',
              }
            ],
          },
          {
            title: '社区',
            items: [
              {
                label: 'Discord',
                href: 'https://discord.com/invite/kuSZHftTqe',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/DecertMe',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                href: 'https://learnblockchain.cn/people/13917',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/decert-me',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Decert.me | <a style="text-decoration-line: none; color: #ebedf0" href="https://beian.miit.gov.cn/" target="_blank" rel="nofollow">粤ICP备17140514号-3</a>`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
