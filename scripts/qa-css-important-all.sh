#!/bin/sh
# 21/11/2026: chạy bộ đo gỡ !important theo từng nhóm, MỖI NHÓM 1 server thử mới (sự kiện không dừng được không chặn sự kiện sau).
# Kết quả cộng dồn (KEEP_FROM) → output/css-important/result.json (stripSigs). Áp: node scripts/qa-css-important.mjs --apply
cd "$(dirname "$0")/.." || exit 1
O=output/css-important; prev="${START_FROM:-}"; [ -z "$prev" ] && rm -f $O/chain.json
run(){ echo "=== $1"; if [ -n "$prev" ]; then KEEP_FROM=$prev ONLY="$1" SKIP_EXTRA=$2 node scripts/qa-css-important.mjs; else ONLY="$1" SKIP_EXTRA=$2 node scripts/qa-css-important.mjs; fi | grep -E "vòng|không mở|^Tổng|Error"; cp $O/result.json $O/chain.json; prev=$O/chain.json; }
run "-" ""   # sân thường + ui=old + trang quản lý (không sự kiện)
for e in "boss" "lôi đài" "linh thú" "hoa" "đèn" "cơ duyên" "bond-festival" "race" "mount-realm" "bao-kho" "hall-war" "war" "alchemy" "maze" "dokiep" "bonk" "tower" "tournament" "vinh danh" "visitor"; do run "$e" 1; done
