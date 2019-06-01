// ==UserScript==
// @name         tangthuvien
// @namespace    https://vfa-vinhtt.github.io/
// @description  Tải truyện từ truyen.tangthuvien.vn định dạng epub
// @version      1.0.2
// @icon         https://raw.githubusercontent.com/vfa-vinhtt/vinScripts/master/download-epub/tangthuvien-downloader.png
// @author       vinhtt
// @oujs:author  vinhtt
// @license      MIT
// @match        https://truyen.tangthuvien.vn/doc-truyen/*
// @require      https://code.jquery.com/jquery-3.4.1.min.js
// @require      https://unpkg.com/jszip@3.2.1/dist/jszip.min.js
// @require      https://unpkg.com/ejs@2.6.1/ejs.min.js
// @require      https://unpkg.com/jepub@2.1.1/dist/jepub.min.js
// @require      https://unpkg.com/file-saver@2.0.2/dist/FileSaver.min.js
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js?v=a834d46
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// ==/UserScript==

(function ($, window, document) {
    'use strict';

    /**
     * Nhận cảnh báo khi có chương bị lỗi
     */
    var errorAlert = false;

    /**
     * Thời gian giãn cách giữa 2 lần tải
     * @type {Number}
     */
    var downloadDelay = 0;


    function cleanHtml(str) {
        str = str.replace(/\s*Chương\s*\d+\s?:[^<\n]/, '');
        str = str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ''); // eslint-disable-line
        return '<div>' + str + '</div>';
    }

    function downloadError(mess, err, server) {
        downloadStatus('danger');
        if (errorAlert) errorAlert = confirm('Lỗi! ' + mess + '\nBạn có muốn tiếp tục nhận cảnh báo?');
        if (err) console.error(mess);

        if (server) {
            if (downloadDelay > 700) {
                titleError.push(chapTitle);
                saveEbook();
                return;
            }

            downloadStatus('warning');
            downloadDelay += 100;
            setTimeout(function () {
                getContent();
            }, downloadDelay);
            return;
        }
        titleError.push(chapTitle);

        return '<p class="no-indent"><a href="' + referrer + chapId + '">' + mess + '</a></p>';
    }

    function genEbook() {
        $download.html('Đang nén EPUB=>genCover=>genEbook');
        document.title = '[epub...] ' + ebookTitle;
        jepub.generate().then(function (epubZipContent) {
            document.title = '[⇓] ' + ebookTitle;
            $win.off('beforeunload');

            $download.attr({
                href: window.URL.createObjectURL(epubZipContent),
                download: ebookFilename
            }).text('Hoàn thành').off('click');
            if (status !== 'danger') downloadStatus('success');

            saveAs(epubZipContent, ebookFilename);
            $download.html('Đang nén EPUB=>genCover=>genEbook=>Success');
        }).catch(function (err) {
            downloadStatus('danger');
            console.error(err);
            $download.html('Đang nén EPUB=>genCover=>genEbook=>Fail');
        });
    }

    function saveEbook() {
        if (endDownload) return;
        endDownload = true;
        $download.html('Đang nén EPUB');

        if (titleError.length) {
            titleError = '<p class="no-indent"><strong>Các chương lỗi: </strong>' + titleError.join(', ') + '</p>';
        } else {
            titleError = '';
        }
        beginEnd = '<p class="no-indent">Nội dung từ <strong>' + begin + '</strong> đến <strong>' + end + '</strong></p>';

        jepub.notes(beginEnd + titleError + '<br /><br />' + credits);
        if(ebookCover){
            $download.html('Đang nén EPUB...cover');
            GM.xmlHttpRequest({
                method: 'GET',
                url: ebookCover,
                responseType: 'arraybuffer',
                onload: function (response) {
                    jepub.cover(response.response);
                    genEbook();
                },
                onerror: function (err) {
                    console.error(err);
                    genEbook();
                }
            });
        } else{
            genEbook();
        }
        
    }

    function getContent() {
        if (endDownload) return;
        chapId = chapList[count];

        $.get(`${pathname}/${chapId}`).done(function (response) {
            var $data = $(response),
                $chapter = $data.find(".chapter-c-content .box-chap:eq(0)"),
                $notContent = $chapter.find('script, style, a'),
                $referrer = $chapter.find('[style]').filter(function () {
                    return (this.style.fontSize === '1px' || this.style.fontSize === '0px' || this.style.color === 'white');
                }),
                chapContent;

            if (endDownload) return;

            chapTitle = $data
            .find(".chapter h2")
            .text()
            .trim();
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

            $download.html('Đang tải: ' + Math.floor((count / chapListSize) * 100) + '%');

            count++;
            document.title = '[' + count + '] ' + pageName;
            if (count >= chapListSize) {
                saveEbook();
            } else {
                setTimeout(function () {
                    getContent();
                }, downloadDelay);
            }
        }).fail(function (err) {
            downloadError('Kết nối không ổn định', err, true);
        });
    }


    var pageName = document.title,
        $win = $(window),

        $download = $('<a>', {
            class: 'btn btn-primary red-btn',
            href: '#download',
            text: 'Tải xuống',
            style: 'margin: 10px 0; display: block;'
        }),
        status,
        downloadStatus = function (label) {
            status = label;
            $download.removeClass('btn-primary btn-success btn-info btn-warning btn-danger').addClass('btn-' + status);
        },
        downloadId = function (url) {
            return url.trim().replace(/^.*\//, '');
        },
        $novelId = $('#story_id_hidden'),
        chapList = [],
        chapListSize = 0,
        chapId = '',
        chapTitle = '',
        count = 0,
        begin = '',
        end = '',
        endDownload = false,

        ebookTitle = $('.book-info h1').text().replace("[Dịch]", "").trim(),
        ebookAuthor = $('.book-info .tag a:eq(0)').text().trim(),
        ebookCover = $('.book-img img').attr('src'),
        ebookType =$('.book-info .tag a:eq(0)').text().trim(),
        ebookDesc =  $(".book-info-detail .book-intro").html(),
        ebookType = [],
        beginEnd = '',
        titleError = [],

        host = location.host,
        pathname = location.pathname,
        referrer = `${location.protocol}//${host}${pathname}`,

        ebookFilename = pathname.slice(12, -1) + '.epub',

        credits = `<p>Truyện được tải từ <a href="${referrer}">tangthuvien</a></p><p>Userscript được viết bởi: <a href="https://vinhtt.github.io">vinhtt</a></p>`,

        jepub;


    if (!$novelId.length) return;

    jepub = new jEpub();
    jepub.init({
        title: ebookTitle,
        author: ebookAuthor,
        publisher: host,
        description: ebookDesc,
        tags: ebookType
    }).uuid(referrer);
    $(".book-info .tag").height(100);
    $download.insertAfter(".book-info .tag a:last-child");
    $download.one('click contextmenu', function (e) {
        e.preventDefault();
        document.title = '[...] Vui lòng chờ trong giây lát';

        $.get('/story/chapters', {
            story_id: $novelId.val()
        }).done(function (data) {
            var $chapList = $(data);
            $chapList.find('li a').each((index, elm) => {
                var href = $(elm).attr('href');
                chapList.push(downloadId(href));
            });
            if (e.type === 'contextmenu') {
                $download.off('click');
                var startFrom = prompt('Nhập ID chương truyện bắt đầu tải:', chapList[0]);
                startFrom = chapList.indexOf(startFrom);
                if (startFrom !== -1) chapList = chapList.slice(startFrom);
            } else {
                $download.off('contextmenu');
            }

            chapListSize = chapList.length;
            if (chapListSize > 0) {
                $win.on('beforeunload', function () {
                    return 'Truyện đang được tải xuống...';
                });

                $download.one('click', function (e) {
                    e.preventDefault();
                    saveEbook();
                });

                getContent();
            }
        }).fail(function (jqXHR, textStatus) {
            downloadError(textStatus);
        });
    });

})(jQuery, window, document);