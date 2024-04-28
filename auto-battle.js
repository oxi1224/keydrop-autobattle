// ==UserScript==
// @name        Auto Keydrop Battle
// @namespace   Violentmonkey Scripts
// @match       https://key-drop.*/*/case-battle/list
// @grant       none
// @version     2.1
// @author      oxi#6219
// @description 04/04/2023, 18:58:17
// ==/UserScript==

const TARGETS = ['BEAST', 'TEETH', 'KICK', 'STACK', 'ADVANCE', 'ICE BLAST'];
const BLACKLIST = ['TECH'];
const MIN_CASES = 2;
const MIN_SPACES = 2;
const USER_AGENT = window.navigator.userAgent;
const SLOT_TO_JOIN = null;

(async () => {
  while (true) {
    await new Promise(r => setTimeout(r, 100));
    const caseBattleContainers = [...document.querySelectorAll('tr.relative')].splice(0, 5);

    for (const container of caseBattleContainers) {
      const names = [...container.querySelectorAll('p.line-clamp-2')].map(elm => elm.textContent);
      const spaceCount = container.querySelector('div.flex.flex-wrap').children.length;
      const joinBtn = container.querySelector('a.button');
      const btnText = joinBtn.textContent;
      const battleID = joinBtn.href.replace(/https:\/\/key-drop\..+\/.+\/case-battle\//, '');
      const caseCount = parseInt(container.querySelector('div.border-2.text-center').textContent);
      const firstFreeSlot = [...container.querySelector('td.border-navy-600 div.flex.flex-wrap').childNodes].findIndex((el) => el.nodeName === 'DIV');
      const ticketPrice = parseInt(container.querySelector("p.absolute")?.textContent?.replace("x", ""));

      if (
        TARGETS.some((caseName) => names.includes(caseName)) &&
        !BLACKLIST.some((caseName) => names.includes(caseName)) &&
        caseCount >= MIN_CASES &&
        spaceCount >= MIN_SPACES &&
        (btnText !== 'Zobacz bitwę' || btnText !== 'Watch the battle') &&
        ticketPrice &&
        typeof ticketPrice === "number"
      ) {
        const bearer = await fetch("https://key-drop.com/token", {
          "method": "GET",
          "credentials": "include",
          "headers": {
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
            "Accept-Language": "en,pl;q=0.7,en-US;q=0.3"
          },
        }).then(async res => await res.text());
        const data = await fetch(`https://kdrp2.com/CaseBattle/joinCaseBattle/${battleID}/${SLOT_TO_JOIN !== null ? SLOT_TO_JOIN: firstFreeSlot}`, {
          "method": "POST",
          "headers": {
            "Authorization": "Bearer " + bearer,
            "User-Agent": USER_AGENT,
            "Accept": "*/*",
            "Accept-Language": "en,pl;q=0.7,en-US;q=0.3",
            "x-currency": "pln"
          },
        }).then(async res => await res.json());
        data.success ? alert('Pomyślnie dołączono'): null;
        if (data.success) break;
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
})();
