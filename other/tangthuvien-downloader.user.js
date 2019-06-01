// ==UserScript==
// @name         tangthuvien downloader
// @namespace    https://vfa-vinhtt.github.io/
// @description  Tải truyện từ truyenfull.vn định dạng epub
// @version      1.0.0
// @icon
// @author       vinhtt
// @oujs:author  vinhtt
// @license      MIT
// @match        https://truyen.tangthuvien.vn/doc-truyen/*
// @require      https://code.jquery.com/jquery-3.3.1.min.js
// @require      https://unpkg.com/jepub@1.2.5/dist/jepub.min.js
// @require      https://unpkg.com/file-saver@2.0.1/dist/FileSaver.min.js
// @noframes
// @connect      self
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function($, window, document) {
    "use strict";

    /**
     * Nhận cảnh báo khi có chương bị lỗi
     */
    var errorAlert = true;

    function cleanHtml(str) {
        str = str.replace(/\s*Chương\s*\d+\s?:[^<\n]/, "");
        str = str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ""); // eslint-disable-line
        return "<div>" + str + "</div>";
    }

    function cleanText(str) {
        return str.replace(/[^\x09\x0A\x0D\x20-\uD7FF\uE000-\uFFFD\u10000-\u10FFFF]+/gm, ""); // eslint-disable-line
    }

    function downloadError(mess, err) {
        downloadStatus("danger");
        titleError.push(chapTitle);
        if (errorAlert) errorAlert = confirm("Lỗi! " + mess + "\nBạn có muốn tiếp tục nhận cảnh báo?");

        if (err) console.error(mess);
        return '<p class="no-indent"><a href="' + referrer + chapId + '">' + mess + "</a></p>";
    }

    function saveEbook() {
        if (endDownload) return;
        endDownload = true;
        $download.html('<i class="iconfont icon-layer"></i> Đang nén EPUB');

        if (titleError.length) {
            titleError = '<p class="no-indent"><strong>Các chương lỗi: </strong>' + titleError.join(", ") + "</p>";
        } else {
            titleError = "";
        }
        beginEnd =
            '<p class="no-indent">Nội dung từ <strong>' + begin + "</strong> đến <strong>" + end + "</strong></p>";

        jepub.notes(beginEnd + titleError + "<br /><br />" + credits);

        jepub
            .generate()
            .then(function(epubZipContent) {
                document.title = "[⇓] " + ebookTitle;
                $win.off("beforeunload");

                $download
                    .attr({
                        href: window.URL.createObjectURL(epubZipContent),
                        download: ebookFilename
                    })
                    .html('<i class="iconfont icon-save"></i> Hoàn thành')
                    .off("click");
                if (!$download.hasClass("btn-danger")) downloadStatus("success");

                saveAs(epubZipContent, ebookFilename);
            })
            .catch(function(err) {
                downloadStatus("danger");
                console.error(err);
            });
    }

    function getContent(pageId) {
        if (endDownload) return;
        chapId = pageId;

        $.get(pathname + "/" + chapId)
            .done(function(response) {
                
                var $data = $(response);
                console.log('response',response);
                if (!chapList) {
                    chapList = [];
                    $data.find("#panel-chap ul li a").each(function(i, e) {
                        var href = $(e).attr("href");
                        console.log('href',href);
                        chapList.push(href);
                    });
                }
                chapList.shift();
                var $chapter = $data.find(".chapter-c-content .box-chap:eq(0)"),
                    $notContent = $chapter.find("script, style, a"),
                    $referrer = $chapter.find("[style]").filter(function() {
                        return (
                            this.style.fontSize === "1px" ||
                            this.style.fontSize === "0px" ||
                            this.style.color === "white"
                        );
                    }),
                    chapContent,
                    nextLink = chapList[0];

                if (endDownload) return;

                chapTitle = $data
                    .find(".chapter h2")
                    .text()
                    .trim();

                if (chapTitle === "") chapTitle = "Chương " + chapId.match(/\d+/)[0];

                if (!$chapter.length) {
                    chapContent = downloadError("Không có nội dung");
                } else {
                    var $img = $chapter.find("img");
                    if ($img.length)
                        $img.replaceWith(function() {
                            return '<br /><a href="' + this.src + '">Click để xem ảnh</a><br />';
                        });

                    if ($notContent.length) $notContent.remove();
                    if ($referrer.length) $referrer.remove();

                    if ($chapter.text().trim() === "") {
                        chapContent = downloadError("Nội dung không có");
                    } else {
                        if (status !== "danger") downloadStatus("warning");
                        chapContent = cleanHtml($chapter.html());
                    }
                }

                jepub.add(chapTitle, chapContent);

                if (count === 0) begin = chapTitle;
                end = chapTitle;
                ++count;

                downloadProgress(count);

                if (nextLink) {
                    getContent(downloadId(nextLink));
                } else {
                    saveEbook();
                }
            })
            .fail(function(err) {
                downloadError("Kết nối không ổn định", err);
                saveEbook();
            });
    }

    var pageName = document.title,
        $win = $(window),
        storyId = $('#story_id_hidden').val(),
        status,
        chapList,
        $download = $("<a>", {
            class: "btn btn-primary red-btn",
            href: "#download",
            text: "Tải xuống"
        }),
        downloadStatus = function(label) {
            status = label;
            $download.removeClass("btn-primary btn-success btn-info btn-warning btn-danger").addClass("btn-" + status);
        },
        downloadProgress = function(progress) {
            document.title = "[" + count + "] " + pageName;
            $download.html('<i class="iconfont icon-more"></i> Đã tải:<span class="pl-2">' + progress + "</span>");
        },
        downloadId = function(url) {
            return url.trim().replace(/^.*\//, "");
        },
        $novelInfo = $(".book-info"),
        chapId = "",
        chapTitle = "",
        count = 0,
        begin = "",
        end = "",
        endDownload = false,
        ebookTitle = $novelInfo
            .find("h1")
            .text()
            .replace("[Dịch]", "")
            .trim(),
        ebookAuthor = $novelInfo
            .find(".tag a:eq(0)")
            .text()
            .trim(),
        ebookType = $novelInfo
            .find(".tag a:eq(1)")
            .text()
            .trim(),
        ebookDesc = $(".book-info-detail .book-intro").html(),
        beginEnd = "",
        titleError = [],
        host = location.host,
        pathname = location.pathname,
        referrer = location.protocol + "//" + host + pathname,
        ebookFilename = pathname.slice(8, -1) + ".epub",
        credits =
            '<p>Truyện được tải từ <a href="' +
            referrer +
            '">GocTruyen</a></p><p>Userscript được viết bởi: <a href="https://vinhtt.github.io">vinhtt</a></p>',
        jepub;

    if (!$novelInfo.length) return;

    jepub = new jEpub({
        title: ebookTitle,
        author: ebookAuthor,
        publisher: host,
        description: ebookDesc,
        tags: ebookType
    }).uuid(referrer);

    $download.insertAfter(".book-info .tag a:last-child");
    $download.one("click contextmenu", function(e) {
        e.preventDefault();
        document.title = "[...] Vui lòng chờ trong giây lát";

        var $firstChap = $("#readBtn");
        var firstChap = downloadId($firstChap.attr("href"));
        var startFrom = firstChap;

        if (e.type === "contextmenu") {
            $download.off("click");
            startFrom = prompt("Nhập ID chương truyện bắt đầu tải:", firstChap) || firstChap;
        } else {
            $download.off("contextmenu");
        }

        $win.on("beforeunload", function() {
            return "Truyện đang được tải xuống...";
        });

        $download.one("click", function(e) {
            e.preventDefault();
            saveEbook();
        });

        getContent(startFrom);
    });
})(jQuery, window, document);
