// ==UserScript==
// @name         goctruyen downloader
// @namespace    https://vfa-vinhtt.github.io/
// @description  Tải truyện từ truyenfull.vn định dạng epub
// @version      1.0.0
// @icon         
// @author       vinhtt
// @oujs:author  vinhtt
// @license      MIT
// @match        https://goctruyen.com/*/
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://unpkg.com/jepub@1.2.5/dist/jepub.min.js
// @require      https://unpkg.com/file-saver@2.0.1/dist/FileSaver.min.js
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function ($, window, document) {
    'use strict';

    /**
     * Nhận cảnh báo khi có chương bị lỗi
     */
    var errorAlert = true;

    function cleanHtml(str) {
        str = str.replace(/\s*Chương\s*\d+\s?:[^<\n]/, '');
        str = str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ''); // eslint-disable-line
        return '<div>' + str + '</div>';
    }

    function cleanText(str) {
        return str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ''); // eslint-disable-line
    }

    function downloadError(mess, err) {
        downloadStatus('danger');
        titleError.push(chapTitle);
        if (errorAlert) errorAlert = confirm('Lỗi! ' + mess + '\nBạn có muốn tiếp tục nhận cảnh báo?');

        if (err) console.error(mess);
        return '<p class="no-indent"><a href="' + referrer + chapId + '">' + mess + '</a></p>';
    }

    function saveEbook() {
        if (endDownload) return;
        endDownload = true;
        $download.html('<i class="iconfont icon-layer"></i> Đang nén EPUB');

        if (titleError.length) {
            titleError = '<p class="no-indent"><strong>Các chương lỗi: </strong>' + titleError.join(', ') + '</p>';
        } else {
            titleError = '';
        }
        beginEnd = '<p class="no-indent">Nội dung từ <strong>' + begin + '</strong> đến <strong>' + end + '</strong></p>';

        jepub.notes(beginEnd + titleError + '<br /><br />' + credits);

        jepub.generate().then(function (epubZipContent) {
            document.title = '[⇓] ' + ebookTitle;
            $win.off('beforeunload');

            $download.attr({
                href: window.URL.createObjectURL(epubZipContent),
                download: ebookFilename
            }).html('<i class="iconfont icon-save"></i> Hoàn thành').off('click');
            if (!$download.hasClass('btn-danger')) downloadStatus('success');

            saveAs(epubZipContent, ebookFilename);
        }).catch(function (err) {
            downloadStatus('danger');
            console.error(err);
        });
    }

    function getContent(pageId) {
        if (endDownload) return;
        chapId = pageId;

        $.get(pathname + chapId).done(function (response) {
            var $data = $(response),
                $chapter = $data.find('#content'),
                $notContent = $chapter.find('script, style, a'),
                $referrer = $chapter.find('[style]').filter(function () {
                    return (this.style.fontSize === '1px' || this.style.fontSize === '0px' || this.style.color === 'white');
                }),
                chapContent,
                $next = $data.find('.chapter-title .chapter-button .nextchap'),
                $vip = [];

            if (endDownload) return;

            chapTitle = $data.find('.chapter-title h1').text().trim();
            if (chapTitle === '') chapTitle = 'Chương ' + chapId.match(/\d+/)[0];

            if (!$chapter.length) {
                chapContent = downloadError('Không có nội dung');
            } else {
                var $img = $chapter.find('img');
                if ($img.length) $img.replaceWith(function () {
                    return '<br /><a href="' + this.src + '">Click để xem ảnh</a><br />';
                });

                if ($notContent.length) $notContent.remove();
                if ($referrer.length) $referrer.remove();

                if ($chapter.text().trim() === '') {
                    chapContent = downloadError('Nội dung không có');
                } else {
                    if (status !== 'danger') downloadStatus('warning');
                    chapContent = cleanHtml($chapter.html());
                }
            }

            jepub.add(chapTitle, chapContent);

            if (count === 0) begin = chapTitle;
            end = chapTitle;
            ++count;

            downloadProgress(count);

            if ($next.hasClass('disabled')) {
                saveEbook();
            } else {
                getContent(downloadId($next.attr('href')));
            }
        }).fail(function (err) {
            downloadError('Kết nối không ổn định', err);
            saveEbook();
        });
    }


    var pageName = document.title,
        $win = $(window),
        status,
        $download = $('<a>', {
            class: 'btn btn-primary w3-btn',
            href: '#download',
            text: 'Tải xuống'
        }),
        downloadStatus = function (label) {
            status = label;
            $download.removeClass('btn-primary btn-success btn-info btn-warning btn-danger').addClass('btn-' + status);
        },
        downloadProgress = function (progress) {
            document.title = '[' + count + '] ' + pageName;
            $download.html('<i class="iconfont icon-more"></i> Đã tải:<span class="pl-2">' + progress + '</span>');
        },
        downloadId = function (url) {
            return url.trim().replace(/^.*\//, '');
        },

        $novelInfo = $('.detail .main-content'),
        chapId = '',
        chapTitle = '',
        count = 0,
        begin = '',
        end = '',
        endDownload = false,

        ebookTitle = $('h1[itemprop="name"]').text().trim(),
        ebookAuthor = $('.detail-info span[itemprop="author"]').text().trim(),
        ebookCover = $('img[itemprop="image"]').attr('src'),
        ebookDesc = $('div[itemprop="description"]').html(),
        ebookType = [],
        beginEnd = '',
        titleError = [],

        host = location.host,
        pathname = location.pathname,
        referrer = location.protocol + '//' + host + pathname,

        ebookFilename = pathname.slice(8, -1) + '.epub',

        credits = '<p>Truyện được tải từ <a href="' + referrer + '">GocTruyen</a></p><p>Userscript được viết bởi: <a href="https://vinhtt.github.io">vinhtt</a></p>',

        jepub;


    if (!$novelInfo.length) return;

    var $ebookType = $('span[itemprop="genre"]');
    if ($ebookType.length) $ebookType.each(function () {
        ebookType.push($(this).text().trim());
    });

    jepub = new jEpub({
        title: ebookTitle,
        author: ebookAuthor,
        publisher: host,
        description: ebookDesc,
        tags: ebookType
    }).uuid(referrer);

    $download.insertAfter('.detail-info');
    $download.one('click contextmenu', function (e) {
        e.preventDefault();
        document.title = '[...] Vui lòng chờ trong giây lát';
        
        var firstChap = $('.list-chapter-content > ul > li:first-child > a.chaptername1');
        firstChap = downloadId(firstChap.attr('href'));
        var startFrom = firstChap;

        if (e.type === 'contextmenu') {
            $download.off('click');
            startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', firstChap) || firstChap;
        } else {
            $download.off('contextmenu');
        }

        $win.on('beforeunload', function () {
            return 'Truyện đang được tải xuống...';
        });

        $download.one('click', function (e) {
            e.preventDefault();
            saveEbook();
        });

        getContent(startFrom);
    });

})(jQuery, window, document);