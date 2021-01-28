'use strict';
// Node.jsに用意されたモジュールを呼び出している
const fs = require('fs'); // fsは、ファイルを扱うためのモジュール
const readline = require('readline'); // readlineは、ファイルを一行ずつ読み込むためのモジュール
// csvファイルからファイル読み込みを行うStreamを生成
const rs = fs.createReadStream('./popu-pref.csv');
// さらにそれをreadlineオブジェクトのinputとして設定しrlオブジェクトを作成
const rl = readline.createInterface({ input: rs, output: {} });

const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト

// rlオブジェクトでlineというイベントが発生したら以下の無名関数を呼び出す
// lineStringには、読み込んだ1行の文字列がはいっている
rl.on('line', lineString => {
  const columns = lineString.split(',');
  const year = parseInt(columns[0]);
  const prefecture = columns[1];
  const popu = parseInt(columns[3]);
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) {
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 = popu;
    }
    if (year === 2015) {
      value.popu15 = popu;
    }
    prefectureDataMap.set(prefecture, value);
  }
});
// 'close'イベントは、全ての行を読み込み終わった際に呼び出される
rl.on('close', () => {
  // 都道府県ごとの変化率を計算
  // for-of構文：MapやArrayの中身をofの前で与えられた変数に代入してforループを行う
  for (let [key, value] of prefectureDataMap) { 
    value.change = value.popu15 / value.popu10;
  }
  // まずArray.from(prefectureDataMap)の部分で、連想配列を普通の配列に変換
  // 更にArrayのsort関数を呼び出して無名関数を渡す
  // 前者の引数pair1を後者の引数pair2より前にしたい場合は負の整数、
  // pair2をpair1より前にしたい場合は正の整数
  // pair1とpair2の並びをそのままにしたい場合は0を返す必要がある
  // ここでは変化率の降順にソートしたいため、pair2がpair1より大きい場合、pair2をpair1より前にする必要がある(正の整数を返す)
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    return pair2[1].change - pair1[1].change;
  });

  // ここに出てくるmapは連想関数Mapとは別物。map関数と呼ぶ
  // map関数は、Arrayの要素それぞれを、与えられた関数を適用した内容に変換する
  const rankingStrings = rankingArray.map(([key, value]) => { 
    return (
      key + ': ' + value.popu10 +  '=>' +  value.popu15 +  ' 変化率:' + value.change
    );
  })
  console.log(rankingStrings);
});