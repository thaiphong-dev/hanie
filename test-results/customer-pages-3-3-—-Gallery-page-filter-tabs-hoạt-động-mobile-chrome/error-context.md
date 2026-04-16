# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: customer\pages.spec.ts >> 3.3 — Gallery page >> filter tabs hoạt động
- Location: tests\e2e\customer\pages.spec.ts:123:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - banner [ref=e3]:
      - generic [ref=e4]:
        - link "Hanie Studio" [ref=e5] [cursor=pointer]:
          - /url: /vi
          - img "Hanie Studio" [ref=e6]
        - button "Open menu" [ref=e7] [cursor=pointer]:
          - img [ref=e8]
    - main [ref=e9]:
      - generic [ref=e10]:
        - generic [ref=e11]:
          - paragraph [ref=e12]: THƯ VIỆN ẢNH
          - heading "Tác phẩm từ Hanie Studio" [level=1] [ref=e13]
        - generic [ref=e16]:
          - button "Tất cả" [ref=e17] [cursor=pointer]
          - button "Lông mày" [ref=e18] [cursor=pointer]
          - button "Gội đầu" [ref=e19] [cursor=pointer]
          - button "Studio" [ref=e20] [cursor=pointer]
          - button "Nối mi" [ref=e21] [cursor=pointer]
          - button "Nail" [ref=e22] [cursor=pointer]
        - generic [ref=e24]:
          - img [ref=e25] [cursor=pointer]
          - img [ref=e28] [cursor=pointer]
          - img [ref=e31] [cursor=pointer]
          - img [ref=e34] [cursor=pointer]
          - img [ref=e37] [cursor=pointer]
          - img [ref=e40] [cursor=pointer]
          - img [ref=e43] [cursor=pointer]
          - img [ref=e46] [cursor=pointer]
          - img [ref=e49] [cursor=pointer]
    - contentinfo [ref=e52]:
      - generic [ref=e53]:
        - generic [ref=e54]:
          - generic [ref=e55]:
            - img "Hanie Studio" [ref=e56]
            - paragraph [ref=e57]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e58]:
            - heading "Dịch vụ" [level=4] [ref=e59]
            - list [ref=e60]:
              - listitem [ref=e61]:
                - link "Nail" [ref=e62] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e63]:
                - link "Nối mi" [ref=e64] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e65]:
                - link "Lông mày" [ref=e66] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e67]:
                - link "Gội đầu" [ref=e68] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e69]:
            - heading "Thông tin" [level=4] [ref=e70]
            - list [ref=e71]:
              - listitem [ref=e72]:
                - img [ref=e73]
                - generic [ref=e76]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e77]:
                - img [ref=e78]
                - link "0901 234 567" [ref=e80] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e81]:
                - img [ref=e82]
                - generic [ref=e85]: 08:00 – 20:00 hàng ngày
          - generic [ref=e86]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e87]
            - link "Đặt lịch ngay" [ref=e88] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e90]: © 2026 Hanie Studio. All rights reserved.
    - navigation [ref=e91]:
      - generic [ref=e92]:
        - link "Trang chủ" [ref=e93] [cursor=pointer]:
          - /url: /vi
          - img [ref=e94]
          - generic [ref=e97]: Trang chủ
        - link "Đặt lịch" [ref=e98] [cursor=pointer]:
          - /url: /vi/booking
          - img [ref=e99]
          - generic [ref=e102]: Đặt lịch
        - link "Lịch sử" [ref=e103] [cursor=pointer]:
          - /url: /vi/history
          - img [ref=e104]
          - generic [ref=e107]: Lịch sử
        - link "Voucher" [ref=e108] [cursor=pointer]:
          - /url: /vi/vouchers
          - img [ref=e109]
          - generic [ref=e112]: Voucher
        - link "Tôi" [ref=e113] [cursor=pointer]:
          - /url: /vi/profile
          - img [ref=e114]
          - generic [ref=e117]: Tôi
  - alert [ref=e118]
```