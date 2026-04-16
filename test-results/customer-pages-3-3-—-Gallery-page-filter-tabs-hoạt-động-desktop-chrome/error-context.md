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
        - navigation [ref=e7]:
          - link "Trang chủ" [ref=e8] [cursor=pointer]:
            - /url: /vi
          - link "Dịch vụ" [ref=e9] [cursor=pointer]:
            - /url: /vi/services
          - link "Thư viện ảnh" [ref=e10] [cursor=pointer]:
            - /url: /vi/gallery
          - link "Đặt lịch" [ref=e11] [cursor=pointer]:
            - /url: /vi/booking
          - link "Địa chỉ" [ref=e12] [cursor=pointer]:
            - /url: /vi/location
        - generic [ref=e13]:
          - generic [ref=e14]:
            - button "Switch to VI" [ref=e15] [cursor=pointer]: VI
            - button "Switch to EN" [ref=e16] [cursor=pointer]: EN
            - button "Switch to KO" [ref=e17] [cursor=pointer]: KO
          - link "Đặt lịch ngay" [ref=e18] [cursor=pointer]:
            - /url: /vi/booking
    - main [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - paragraph [ref=e22]: THƯ VIỆN ẢNH
          - heading "Tác phẩm từ Hanie Studio" [level=1] [ref=e23]
        - generic [ref=e26]:
          - button "Tất cả" [ref=e27] [cursor=pointer]
          - button "Lông mày" [ref=e28] [cursor=pointer]
          - button "Gội đầu" [ref=e29] [cursor=pointer]
          - button "Studio" [ref=e30] [cursor=pointer]
          - button "Nối mi" [ref=e31] [cursor=pointer]
          - button "Nail" [ref=e32] [cursor=pointer]
        - generic [ref=e34]:
          - img [ref=e35] [cursor=pointer]
          - img [ref=e38] [cursor=pointer]
          - img [ref=e41] [cursor=pointer]
          - img [ref=e44] [cursor=pointer]
          - img [ref=e47] [cursor=pointer]
          - img [ref=e50] [cursor=pointer]
          - img [ref=e53] [cursor=pointer]
          - img [ref=e56] [cursor=pointer]
          - img [ref=e59] [cursor=pointer]
    - contentinfo [ref=e62]:
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - img "Hanie Studio" [ref=e66]
            - paragraph [ref=e67]: Studio làm đẹp tại Quy Nhơn. Nối mi · Lông mày · Gội đầu · Nail.
          - generic [ref=e68]:
            - heading "Dịch vụ" [level=4] [ref=e69]
            - list [ref=e70]:
              - listitem [ref=e71]:
                - link "Nail" [ref=e72] [cursor=pointer]:
                  - /url: /vi/services#nail
              - listitem [ref=e73]:
                - link "Nối mi" [ref=e74] [cursor=pointer]:
                  - /url: /vi/services#lash
              - listitem [ref=e75]:
                - link "Lông mày" [ref=e76] [cursor=pointer]:
                  - /url: /vi/services#brow
              - listitem [ref=e77]:
                - link "Gội đầu" [ref=e78] [cursor=pointer]:
                  - /url: /vi/services#hair_wash
          - generic [ref=e79]:
            - heading "Thông tin" [level=4] [ref=e80]
            - list [ref=e81]:
              - listitem [ref=e82]:
                - img [ref=e83]
                - generic [ref=e86]: 55 Nguyễn Nhạc, Quy Nhơn
              - listitem [ref=e87]:
                - img [ref=e88]
                - link "0901 234 567" [ref=e90] [cursor=pointer]:
                  - /url: tel:0901234567
              - listitem [ref=e91]:
                - img [ref=e92]
                - generic [ref=e95]: 08:00 – 20:00 hàng ngày
          - generic [ref=e96]:
            - heading "Đặt lịch nhanh" [level=4] [ref=e97]
            - link "Đặt lịch ngay" [ref=e98] [cursor=pointer]:
              - /url: /vi/booking
        - paragraph [ref=e100]: © 2026 Hanie Studio. All rights reserved.
  - alert [ref=e101]
```