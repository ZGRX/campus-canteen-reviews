import dongyue from '../docs/life/dongyue.md?raw'
import fenghuang from '../docs/life/fenghuang.md?raw'
import longshan from '../docs/life/longshan.md?raw'
import tianzhu from '../docs/life/tianzhu.md?raw'

const photos = import.meta.glob('../docs/life/campus-canteens-images/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url',
}) as Record<string, string>

export function photoUrl(path?: string) {
  return photos['../docs/life/campus-canteens-images/' + path?.split('/').pop()]
}

export const halls = [
  { id: 'fenghuang', name: '凤凰厅' },
  { id: 'dongyue', name: '东岳厅' },
  { id: 'tianzhu', name: '天烛厅' },
  { id: 'longshan', name: '龙山厅' },
] as const

type Hall = (typeof halls)[number]

export interface Stall {
  id: string
  name: string
  hall: Hall
  category: string
  note: string
  cover?: string
  location?: string
}

function readHall(hall: Hall, markdown: string, entries: Record<string, [string, string]>): Stall[] {
  const sections = markdown.split(/^#### /m).slice(1)
  if (sections.length !== Object.keys(entries).length) {
    throw new Error('窗口资料与目录不匹配：' + hall.name)
  }
  const foundIds = new Set<string>()
  return sections.map((section) => {
    const lineBreak = section.indexOf('\n')
    const name = section.slice(0, lineBreak).trim()
    const note = section.slice(lineBreak + 1).trim()
    const entry = entries[name]
    if (!entry || foundIds.has(entry[0])) throw new Error('窗口缺少唯一编号：' + name)
    const [id, category] = entry
    foundIds.add(id)
    return {
      id, name, hall, category, note,
      cover: photoUrl(note.match(/!\[[^\]]*\]\(([^)]+)\)/)?.[1]),
      location: note.match(/^位置[：:][ \t]*(.+)$/m)?.[1]?.trim(),
    }
  })
}

// Two records in the original notes did not use a Markdown heading.
const tianzhuSections = tianzhu.replace(/^清真牛肉拉面$/m, '#### 清真牛肉拉面')
const dongyueSections = dongyue
  .replace(/^(?=!\[[^\]]+\]\([^)]*pasted-20260624015527\.jpg\))/m, '#### 滑蛋饭\n\n')

const fenghuangStalls = readHall(halls[0], fenghuang, {
  '巧心婆（酸辣猪肘面）': ['qiaoxinpo', '面食'],
  '凤凰安徽板面': ['anhui-ban-mian', '面食'],
  '凤凰自选菜': ['fenghuang-buffet', '自选菜'],
  '早餐小笼包+豆腐脑': ['breakfast', '早餐'],
  '麻辣香锅': ['mala-xiangguo', '米饭简餐'],
  '鸡架拌面': ['chicken-noodles', '面食'],
  '牛肉泡馍': ['beef-paomo', '面食'],
})

const dongyueStalls = readHall(halls[1], dongyueSections, {
  '馋嘴鱼': ['chanzuiyu', '米饭简餐'],
  '东岳的自选菜（曾经在傲来南边）': ['dongyue-buffet', '自选菜'],
  '滑蛋饭': ['silky-egg-rice', '米饭简餐'],
})

const tianzhuStalls = readHall(halls[2], tianzhuSections, {
  '手工水饺': ['dumplings', '面食'],
  '牛扒or鸡扒 意面/米': ['steak-pasta', '米饭简餐'],
  '炖顿湘': ['dundunxiang', '米饭简餐'],
  '清真牛肉拉面': ['halal-beef-noodles', '面食'],
})

const longshanStalls = readHall(halls[3], longshan, {
  '天下好面': ['tianxia-noodles', '面食'],
  '烈焰烧肉饭': ['lieyan-rice', '米饭简餐'],
  '牛杂面': ['offal-noodles', '面食'],
  '正宗山东杂粮煎饼': ['shandong-pancake', '小吃'],
  '陕西面': ['shaanxi-noodles', '面食'],
  '味思顿 辣椒炒肉': ['wisdom-pepper-pork', '米饭简餐'],
  '双拼饭+肉夹馍': ['double-rice-roujiamo', '米饭简餐'],
  '小笼包': ['xiaolongbao', '早餐'],
})

const featuredIds = ['qiaoxinpo', 'silky-egg-rice', 'dumplings']
const allStalls = [...fenghuangStalls, ...dongyueStalls, ...tianzhuStalls, ...longshanStalls]
export const stalls = [
  ...featuredIds.map((id) => allStalls.find((stall) => stall.id === id)!),
  ...allStalls.filter((stall) => !featuredIds.includes(stall.id)),
]
