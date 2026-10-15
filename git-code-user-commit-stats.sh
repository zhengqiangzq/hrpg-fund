#!/bin/sh
 
# 请在 unix 终端或 git-bash 中运行此脚本

startTime="$1"
endTime="$2"
echo "startTime:$startTime - endTime:$endTime"

printf "\n1. 项目成员数量："; git log --pretty='%aN' | sort -u | wc -l
 
printf "\n\n2. 按用户名统计代码提交次数：\n\n"
printf "%10s  %s\n" "次数" "用户名"
#  按用户名统计代码提交次数，并按次数降序排列前10名。
git log --since="$startTime" --until="$endTime" --pretty='%aN' | sort | uniq -c | sort -k1 -n -r | head -n 10
printf "\n%10s" "合计";
printf "\n%5s" ""; git log --since="$startTime" --until="$endTime" --oneline | wc -l
 
printf "\n3. 按用户名统计代码提交行数：\n\n"
printf "%s %+35s   =  %+15s   -  %+15s\n" "用户名" "总行数" "添加行数" "删除行数"
# 遍历项目成员（按提交次数降序）
git log --format='%aN' | sort -u -r | while read name; do printf "%-25s" "$name"; \
# 统计每个成员的代码提交行数
git log --author="$name" --since="$startTime" --until="$endTime" --pretty=tformat: --numstat | \
awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "%15s %15s %15s \n", loc, add, subs }' \
-; done
 
printf "\n%-25s   " "总计：" ; git log --since="$startTime" --until="$endTime" --pretty=tformat: --numstat | \
awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "%15s %15s %15s \n", loc, add, subs }'
 
echo ""
# shellcheck disable=SC2162
read -n 1 -p "请按任意键继续..."
